const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');

const Chat = sequelize.define('Chat', {
  chatID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user1ID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userID',
    },
    allowNull: false,
  },
  user2ID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userID',
    },
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Definiowanie relacji
Chat.belongsTo(User, { as: 'User1', foreignKey: 'user1ID', onDelete: 'CASCADE' });
Chat.belongsTo(User, { as: 'User2', foreignKey: 'user2ID', onDelete: 'CASCADE' });

module.exports = Chat;
