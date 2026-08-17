const Message = require('../models/Message');

/**
 * Builds the current turn context for a message about to be sent.
 *
 * A "turn" = all consecutive messages from the same sender in a chat,
 * before the other participant last replied. Concatenating them into one
 * text unit solves the fragmentation problem (e.g. a user sending
 * "dodaj mnie", "na instagrama", "@patryk" as three separate messages).
 *
 * Must be called BEFORE the new message is saved, so that the returned
 * previousMessageIDs reflects only already-persisted messages.
 *
 * @param {number} chatID
 * @param {number} senderID
 * @param {string} newMessageText  - the message being sent right now
 * @returns {{ turnText: string, previousMessageIDs: number[], messageCount: number }}
 */
async function buildCurrentTurn(chatID, senderID, newMessageText) {
  // Fetch recent history newest-first; 50 is a safe upper bound for one turn.
  const recent = await Message.findAll({
    where: { chatID },
    order: [['createdAt', 'DESC']],
    limit: 50,
    attributes: ['messageID', 'senderID', 'messageContent'],
  });

  // Walk backwards (newest → oldest), collecting messages from the same sender
  // until we hit a message from the other participant — that's the turn boundary.
  const turnMessages = [];
  for (const msg of recent) {
    if (String(msg.senderID) !== String(senderID)) break;
    turnMessages.unshift(msg); // prepend to restore chronological order
  }

  const previousMessageIDs = turnMessages.map(m => m.messageID);
  const turnText = [...turnMessages.map(m => m.messageContent), newMessageText].join(' ');

  return {
    turnText,
    previousMessageIDs,
    messageCount: previousMessageIDs.length + 1,
  };
}

module.exports = { buildCurrentTurn };
