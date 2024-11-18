// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
  userID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  avatarURL: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = User;
