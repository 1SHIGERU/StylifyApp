const { Sequelize } = require('sequelize');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const ContactMessage = require('../models/ContactMessage');
const MessageFlag = require('../models/MessageFlag');
const { checkMessage } = require('../utils/rules');

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
    const message = await Message.create({ chatID, senderID, messageContent });

    // run deterministic + heuristic check
    const result = checkMessage(messageContent || "", { senderID });

    // save history
    await MessageFlag.create({
      messageID: message.messageID,
      label: result.label,
      confidence: result.confidence,
      detector: 'rules_v1',
      reason: result.reason,
    });

    if (result.action === 'block') {
      // mark message as flagged + blocked
      await message.update({
        flagged: true,
        flaggedLabel: result.label,
        flaggedReason: result.reason,
        flagConfidence: result.confidence,
        blocked: true
      });

      // return blocked response (frontend shows modal with policy)
      return res.status(200).json({
        id: message.messageID,
        action: 'block',
        blocked: true,
        uiMessage: 'Wiadomości zawierające dane kontaktowe (telefon/e-mail/numer konta) są zabronione. Twoja wiadomość została zablokowana. Jeżeli uważasz, że to błąd, odwołaj się do moderatora.'
      });
    }

    // if warn -> allow sending but warn on frontend
    if (result.action === 'warn') {
      await message.update({
        flagged: true,
        flaggedLabel: result.label,
        flaggedReason: result.reason,
        flagConfidence: result.confidence,
      });
      // send message to recipient normally, but return warn to frontend so it can display banner
      // <- tutaj wywołaj existing send/publish code
      return res.status(200).json({ id: message.messageID, action: 'warn', uiMessage: 'Wiadomość może zawierać podejrzane treści. Uważaj.' });
    }

    // default: allow
    // send message to recipient normally
    return res.status(200).json({ id: message.messageID, action: 'allow' });
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
        where: { chatID },
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
