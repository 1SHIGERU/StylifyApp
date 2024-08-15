const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('../models/User');

const Notification = sequelize.define('Notification', {
    notificationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userID: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'userID',
        },
    },
    type: {
        type: DataTypes.STRING,
    },
    message: {
        type: DataTypes.STRING,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

User.hasMany(Notification, { foreignKey: 'userID' }, { onDelete: 'cascade' });

module.exports = Notification;