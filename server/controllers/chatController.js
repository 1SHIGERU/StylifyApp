const { Sequelize } = require('sequelize');
const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const ContactMessage = require('../models/ContactMessage');
const MessageFlag = require('../models/MessageFlag');
const ConversationTurn = require('../models/ConversationTurn');
const { checkMessage } = require('../utils/rules');
const { buildCurrentTurn } = require('../utils/turns');

// ---------------------------------------------------------------------------
// ML Service — Hybrid B+C pipeline
// ---------------------------------------------------------------------------
const ML_URL = process.env.ML_SERVICE_URL || 'http://ml-service:8000';
const ML_TIMEOUT = 8000;

function mlPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ message: body });
    const url = new URL(ML_URL + path);
    const lib = url.protocol === 'https:' ? https : http;
    const timer = setTimeout(() => reject(new Error('ML timeout')), ML_TIMEOUT);
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => { clearTimeout(timer); resolve(JSON.parse(data)); });
    });
    req.on('error', (e) => { clearTimeout(timer); reject(e); });
    req.write(payload);
    req.end();
  });
}

async function callPresidio(text) {
  return mlPost('/classify/presidio', text);
}

async function callHerbert(text) {
  return mlPost('/classify/herbert', text);
}

// Presidio label → taksonomia pracy
const PRESIDIO_LABEL_MAP = {
  personal_data_request: 'bypass',
  payment_scam: 'fraud',
  platform_bypass: 'bypass',
  toxic_content: 'toxic',
  benign: 'benign',
};

async function runHybridPipeline(turnText, currentMessage) {
  const pipelineStartedAt = performance.now();
  const dev = {
    pipeline: 'hybrid_B_C',
    presidioFired: false,
    herbertFired: false,
    fallback: false,
    presidio: null,
    herbert: null,
    timings: {
      presidioMs: null,
      herbertMs: null,
      totalMs: null,
    },
  };

  try {
    // --- Krok 1: Presidio (B) ---
    const presidioStartedAt = performance.now();
    const pres = await callPresidio(turnText);
    dev.timings.presidioMs = Number((performance.now() - presidioStartedAt).toFixed(2));
    dev.presidio = {
      action: pres.action,
      label: pres.label,
      confidence: pres.confidence,
      entities: pres.entities || [],
    };

    if (pres.action !== 'allow') {
      dev.presidioFired = true;
      dev.timings.totalMs = Number((performance.now() - pipelineStartedAt).toFixed(2));
      const label = PRESIDIO_LABEL_MAP[pres.label] || pres.label;
      return {
        action: pres.action,
        label,
        reason: pres.entities?.[0]?.type || pres.label,
        confidence: pres.confidence,
        dev,
      };
    }

    // --- Krok 2: HerBERT fine-tuned (C) — dual: bieżąca wiadomość + pełna turna ---
    // Klasyfikujemy OBIE wersje, żeby uniknąć efektu rozmycia (dilution):
    // benignowy początek turny może ukryć atak w ostatniej wiadomości.
    // Filtr min. słów zapobiega fałszywym alarmom na krótkich pozdrowieniach ("no hejka").
    const MIN_WORDS = 4;
    const currentWords = (currentMessage || '').trim().split(/\s+/).filter(Boolean);
    const turnWords = turnText.trim().split(/\s+/).filter(Boolean);

    const herbertStartedAt = performance.now();
    const [herbMsg, herbTurn] = await Promise.all([
      currentWords.length >= MIN_WORDS ? callHerbert(currentMessage) : Promise.resolve(null),
      turnWords.length >= MIN_WORDS ? callHerbert(turnText) : Promise.resolve(null),
    ]);
    dev.timings.herbertMs = Number((performance.now() - herbertStartedAt).toFixed(2));

    // Wybierz bardziej surowy wynik spośród obu klasyfikacji
    const pickWorse = (a, b) => {
      const rank = { block: 2, warn: 1, allow: 0 };
      if (!a) return b;
      if (!b) return a;
      return rank[a.action] >= rank[b.action] ? a : b;
    };
    const herb = pickWorse(herbMsg, herbTurn);

    dev.herbert = herb ? {
      available: herb.available,
      label: herb.label,
      action: herb.action,
      confidence: herb.confidence,
      all_labels: herb.all_labels || [],
    } : { available: false };

    if (herb && herb.available && herb.action !== 'allow') {
      dev.herbertFired = true;
      dev.timings.totalMs = Number((performance.now() - pipelineStartedAt).toFixed(2));
      return {
        action: herb.action,
        label: herb.label,
        reason: herb.label,
        confidence: herb.confidence,
        dev,
      };
    }

    dev.timings.totalMs = Number((performance.now() - pipelineStartedAt).toFixed(2));
    return { action: 'allow', label: 'benign', reason: null, confidence: 0, dev };

  } catch (err) {
    // ML service niedostępny — fallback do rules_v1
    console.warn('[hybrid] ML service unavailable, falling back to rules_v1:', err.message);
    dev.fallback = true;
    dev.timings.totalMs = Number((performance.now() - pipelineStartedAt).toFixed(2));
    const fallback = checkMessage(turnText, {});
    return { ...fallback, dev };
  }
}

const classifyForPerformanceTest = async (req, res) => {
  if (process.env.ENABLE_LOAD_TEST_ENDPOINT !== 'true') {
    return res.status(404).json({ error: 'Not found' });
  }

  const { message } = req.body;
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message must be a non-empty string' });
  }

  const startedAt = performance.now();
  const result = await runHybridPipeline(message, '');

  return res.status(200).json({
    action: result.action,
    label: result.label,
    confidence: result.confidence,
    serverDurationMs: Number((performance.now() - startedAt).toFixed(2)),
    devInfo: result.dev,
  });
};

const createChat = async (req, res) => {
    const { user1ID, user2ID } = req.body;

    try {
        let existingChat = await Chat.findOne({
            where: {
              [Sequelize.Op.or]: [
                { user1ID: user1ID, user2ID: user2ID },
                { user1ID: user2ID, user2ID: user1ID }
              ]
            }
        });

    if (existingChat) {
        return res.status(200).json(existingChat);
    }
  
      const newChat = await Chat.create({
        user1ID,
        user2ID
      });
  
      res.status(201).json(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  };

  const sendMessage = async (req, res) => {
  const { chatID, senderID, messageContent } = req.body;

  try {
    // 1. Build turn context BEFORE saving so we get only already-persisted messages.
    const { turnText, previousMessageIDs, messageCount } = await buildCurrentTurn(
      chatID, senderID, messageContent || ''
    );

    // 2. Save the new message.
    const message = await Message.create({ chatID, senderID, messageContent });

    const allMessageIDs = [...previousMessageIDs, message.messageID];

    // 3. Classify the FULL TURN text — not just the single message.
    //    This catches fragmented abuse (e.g. phone number split across 3 messages).
    const result = await runHybridPipeline(turnText, messageContent);

    // 4. Upsert ConversationTurn.
    //    If this is a continuation of an existing turn, update it;
    //    otherwise create a new turn record.
    const turnData = {
      chatID,
      senderID,
      turnText,
      messageIDs: allMessageIDs,
      messageCount,
      lastMessageID: message.messageID,
      flagged: result.action !== 'allow',
      blocked: result.action === 'block',
      flagLabel: result.label,
      flagReason: result.reason,
      flagConfidence: result.confidence,
    };

    if (previousMessageIDs.length > 0) {
      const lastPreviousID = previousMessageIDs[previousMessageIDs.length - 1];
      const existingTurn = await ConversationTurn.findOne({
        where: { lastMessageID: lastPreviousID, chatID, senderID },
      });
      if (existingTurn) {
        await existingTurn.update(turnData);
      } else {
        await ConversationTurn.create(turnData);
      }
    } else {
      await ConversationTurn.create(turnData);
    }

    // 5. Save per-message flag (backward-compatible with existing moderation panel).
    const detector = result.dev?.fallback ? 'rules_v1_fallback' : 'hybrid_B_C';
    await MessageFlag.create({
      messageID: message.messageID,
      label: result.label,
      confidence: result.confidence,
      detector,
      reason: result.reason,
    });

    const devInfo = {
      ...(result.dev || {}),
      turn: {
        messageCount,
        preview: turnText.length > 120 ? turnText.slice(0, 120) + '…' : turnText,
      },
    };

    // 6. Apply moderation action.
    if (result.action === 'block') {
      await message.update({
        flagged: true,
        flaggedLabel: result.label,
        flaggedReason: result.reason,
        flagConfidence: result.confidence,
        blocked: true,
      });
      return res.status(200).json({
        id: message.messageID,
        action: 'block',
        blocked: true,
        label: result.label,
        reason: result.reason,
        confidence: result.confidence,
        uiMessage: 'Wiadomości zawierające dane kontaktowe (telefon/e-mail/numer konta) są zabronione. Twoja wiadomość została zablokowana. Jeżeli uważasz, że to błąd, odwołaj się do moderatora.',
        devInfo,
      });
    }

    if (result.action === 'warn') {
      await message.update({
        flagged: true,
        flaggedLabel: result.label,
        flaggedReason: result.reason,
        flagConfidence: result.confidence,
      });
      return res.status(200).json({
        id: message.messageID,
        action: 'warn',
        label: result.label,
        reason: result.reason,
        confidence: result.confidence,
        uiMessage: 'Wiadomość może zawierać podejrzane treści. Uważaj.',
        devInfo,
      });
    }

    return res.status(200).json({ id: message.messageID, action: 'allow', devInfo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

const markFlag = async (req, res) => {
  const { flagID } = req.params;
  const { decision, moderatorID, note } = req.body; // decision: 'tp' | 'fp'
  try {
    const flag = await MessageFlag.findByPk(flagID);
    if(!flag) return res.status(404).json({ error: 'Flag not found' });

    // zapisz decyzję (możesz dodać pola do MessageFlag: moderatorDecision, moderatorID, decisionNote)
    await flag.update({
      moderatorDecision: decision,
      moderatorID,
      decisionNote: note
    });

    // jeśli FP -> możesz odznaczyć message.flagged = false
    if(decision === 'fp'){
      const msg = await Message.findByPk(flag.messageID);
      if(msg){
        await msg.update({ flagged: false, flaggedLabel: null, flaggedReason: null, flagConfidence: null });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark flag' });
  }
};

const getChatMessages = async (req, res) => {
  const { chatID } = req.params;
  const limit = Number(req.query.limit) || 10;
  try {
    const messages = await Message.findAll({
      where: { chatID },
      order: [['createdAt','DESC']],
      limit,
    });
    return res.json(messages.reverse()); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};


  const checkUnreadMessages = async (req, res) => {
    const { id: userID } = req.params;
    try {
      const chats = await Chat.findAll({
        where: {
          [Sequelize.Op.or]: [
            { user1ID: userID },
            { user2ID: userID },
          ],
        },
      });
  
      const chatIDs = chats.map((chat) => chat.chatID);
  
      const unreadCount = await Message.count({
        where: {
          chatID: chatIDs,
          senderID: { [Sequelize.Op.ne]: userID },
          isRead: false,
        },
      });
  
      res.status(200).json({ unreadCount });
    } catch (error) {
      console.error('Błąd przy sprawdzaniu nieprzeczytanych wiadomości:', error);
      res.status(500).send('Nie udało się sprawdzić wiadomości');
    }
  };

  const setAsRead = async (req, res) => {
  
    const { userID, chatID } = req.body;

  try {
    await Message.update(
      { isRead: true }, 
      {
        where: {
          chatID,
          senderID: { [Sequelize.Op.ne]: userID },
        },
      }
    );

    res.status(200).send('Wiadomości oznaczone jako przeczytane');
  } catch (error) {
    console.error('Błąd przy oznaczaniu wiadomości jako przeczytane:', error);
    res.status(500).send('Nie udało się oznaczyć wiadomości');
  }
};

const sendContactMessage = async (req, res) => {
    const { email, fullName, message, phoneNumber, companyName } = req.body;

    try {
        const newContactMessage = await ContactMessage.create({
            email,
            fullName,
            message,
            phoneNumber,
            companyName
        });

        res.status(201).json(newContactMessage);
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ error: 'Failed to send contact message' });
    }
}

const getContactMessages = async (req, res) => {
    try {
        const contactMessages = await ContactMessage.findAll();
        res.status(200).json(contactMessages);
    } catch (error) {
        console.error('Error retrieving contact messages:', error);
        res.status(500).json({ error: 'Failed to retrieve contact messages' });
    }
}


const getMessagesByChatID = async (req, res) => {

    const { id: chatID } = req.params;
    try {

      const messages = await Message.findAll({
        where: {
          chatID,
          [Sequelize.Op.or]: [{ blocked: false }, { blocked: null }],
        },
        include: [
          {
            model: User,
            attributes: ['username','avatarURL'],

          },
        ],
        order: [['createdAt', 'ASC']],
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error retrieving messages:', error);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  };

const getUserChats = async (req, res) => {

    const { id: userID } = req.params;

    try {    
      const chats = await Chat.findAll({
        where: {
          [Sequelize.Op.or]: [
            { user1ID: userID },
            { user2ID: userID },
          ],
        },
        include: [
          {
            model: User,
            as: 'User1',
            attributes: ['username','avatarURL'],
          },
          {
            model: User,
            as: 'User2',
            attributes: ['username','avatarURL'],
          },
        ],
      });
  
      res.status(200).json(chats);
    } catch (error) {
      console.error('Error retrieving user chats:', error);
      res.status(500).json({ error: 'Failed to retrieve user chats' });
    }
  };

const deleteContactMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await ContactMessage.destroy({
            where: {
              contactMessageID: id
            }
        });
        res.status(200).json({ message: 'Contact message deleted' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ error: 'Failed to delete contact message' });
    }
}

module.exports = {
    createChat,
    classifyForPerformanceTest,
    sendMessage,
    getChatMessages,
    getMessagesByChatID,
    getUserChats,
    sendContactMessage,
    getContactMessages,
    deleteContactMessage,
    checkUnreadMessages,
    setAsRead
};
