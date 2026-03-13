const fs = require('fs');
const { sequelize } = require('../db');
const Message = require('../models/Message');
const MessageFlag = require('../models/MessageFlag');
const stringify = require('csv-stringify/sync');

(async () => {
  try {
    await sequelize.authenticate();

    const flags = await MessageFlag.findAll({
      include: [{ model: Message }],
      order: [['createdAt', 'DESC']],
      limit: 10000,
    });

    const rows = flags.map(f => ({
      flagID: f.id,
      messageID: f.messageID,
      chatID: f.Message ? f.Message.chatID : null,
      senderID: f.Message ? f.Message.senderID : null,
      messageContent: f.Message ? f.Message.messageContent : null,
      label: f.label,
      detector: f.detector,
      confidence: f.confidence,
      reason: f.reason,
      createdAt: f.createdAt
    }));

    const csv = stringify.stringify(rows, { header: true });

    fs.writeFileSync('./flagged_export.csv', csv);
    console.log('Exported', rows.length, 'rows to flagged_export.csv');

  } catch (err) {
    console.error("Export error:", err);
  } finally {
    process.exit(0);
  }
})();
