const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ContactMessage = sequelize.define('ContactMessage', {
    contactMessageID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING },
    companyName: { type: DataTypes.STRING },  
    
    }, {
        timestamps: true
    });

module.exports = ContactMessage;