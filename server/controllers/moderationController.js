// controllers/moderationController.js

const MessageFlag = require('../models/MessageFlag');
const Message = require('../models/Message');

// GET /moderation/flags?status=pending&limit=50
exports.getFlags = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;

    // pobierz wszystkie flagi bez decyzji moderacyjnej (pending)
    const flags = await MessageFlag.findAll({
      where: { moderatorDecision: null },
      include: [{ model: Message }],
      order: [['createdAt', 'DESC']],
      limit
    });

    return res.json(flags);

  } catch (err) {
    console.error("getFlags error:", err);
    return res.status(500).json({ error: "Failed to fetch flags" });
  }
};


// POST /moderation/flags/:flagId/mark
exports.markFlag = async (req, res) => {
  const { flagId } = req.params;
  const { decision, moderatorID, note } = req.body;

  try {
    const flag = await MessageFlag.findByPk(flagId);
    if (!flag) return res.status(404).json({ error: "Flag not found" });

    // zapisz decyzję
    await flag.update({
      moderatorDecision: decision,
      moderatorID: moderatorID || null,
      decisionNote: note || null,
    });

    // jeśli FP → odblokuj wiadomość oraz usuń flagę z głównej tabeli
    if (decision === "fp") {
      const msg = await Message.findByPk(flag.messageID);
      if (msg) {
        await msg.update({
          flagged: false,
          blocked: false,
          flaggedLabel: null,
          flaggedReason: null,
          flagConfidence: null
        });
      }
    }

    // jeśli BAN → moderator może zbanować użytkownika
    if (decision === "ban") {
      // możesz tu dodać logikę banowania użytkownika
      // np: const msg = await Message.findByPk(flag.messageID);
      // User.update({ isBanned: true }, { where: { userID: msg.senderID } });
    }

    return res.json({ ok: true });

  } catch (err) {
    console.error("markFlag error:", err);
    return res.status(500).json({ error: "Failed to save decision" });
  }
};


// POST /moderation/flags/:flagId/override
exports.overrideFlag = async (req, res) => {
  const { flagId } = req.params;
  const { action, moderatorID, note } = req.body;

  try {
    const flag = await MessageFlag.findByPk(flagId);
    if (!flag) return res.status(404).json({ error: "Flag not found" });

    const msg = await Message.findByPk(flag.messageID);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    if (action === "unblock") {
      await msg.update({
        blocked: false,
        flagged: false,
        flaggedLabel: null,
        flaggedReason: null,
        flagConfidence: null
      });
    }

    await flag.update({
      moderatorDecision: action,
      moderatorID,
      decisionNote: note
    });

    return res.json({ ok: true });

  } catch (err) {
    console.error("overrideFlag error:", err);
    return res.status(500).json({ error: "Failed to override" });
  }
};
