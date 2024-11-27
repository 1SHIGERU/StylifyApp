const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Chat = require('./Chat');

const Message = sequelize.define('Message', {
  messageID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatID: {
    type: DataTypes.INTEGER,
    references: {
      model: Chat,
      key: 'chatID',
    },
    allowNull: false,
  },
  senderID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userID',
    },
    allowNull: false,
  },
  messageContent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
  },
}, {
  timestamps: true,
});

Message.belongsTo(Chat, { foreignKey: 'chatID', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderID', onDelete: 'CASCADE' });

module.exports = Message;
