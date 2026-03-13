// models/MessageFlag.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Message = require('./Message');

const MessageFlag = sequelize.define('MessageFlag', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  messageID: {
    type: DataTypes.INTEGER,
    references: {
      model: Message,
      key: 'messageID',
    },
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  detector: {
    type: DataTypes.STRING, // e.g. 'rules_v1', 'ml_v1'
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  moderatorDecision: {
    type: DataTypes.STRING, // e.g. 'approved', 'rejected'
    allowNull: true,
  },
  moderatorID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  decisionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

MessageFlag.belongsTo(Message, { foreignKey: 'messageID', onDelete: 'CASCADE' });

module.exports = MessageFlag;
