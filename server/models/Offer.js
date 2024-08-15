const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('../models/User');

const Offer = sequelize.define('Offer', {
    offerID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ownerID: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'userID',
        },
    },
    title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.FLOAT,
    },
    category: {
        type: DataTypes.STRING,
    },
    createdDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    forMen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    dominantColor: {
        type: DataTypes.STRING,
    },


});

module.exports = Offer;