const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Chat = require('./Chat');

const ConversationTurn = sequelize.define('ConversationTurn', {
  turnID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Full turn text — concatenated messages from this turn, space-separated.
  // Used as the unit of classification (solves message fragmentation).
  turnText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // IDs of all messages belonging to this turn (Postgres native array).
  messageIDs: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    defaultValue: [],
  },
  messageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  // ID of the last message in this turn — used to find and update the turn
  // when the next message from the same sender arrives.
  lastMessageID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Moderation result on the full turn text
  flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  flagLabel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  flagReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  flagConfidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // Dataset annotation — filled during manual labeling for training data.
  // Values: 'bypass' | 'fraud' | 'toxic' | 'benign' | null (not yet annotated)
  annotation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

ConversationTurn.belongsTo(Chat, { foreignKey: 'chatID', onDelete: 'CASCADE' });

module.exports = ConversationTurn;
