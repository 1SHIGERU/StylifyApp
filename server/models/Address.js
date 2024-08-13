const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');

const Address = sequelize.define('Address', {
    addressID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userID: {
        type: DataTypes.INTEGER,
        references: {
        model: User,
        key: 'userID',
        },
    },
    street: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    postcode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    });

User.hasOne(Address, { foreignKey: 'userID', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userID' });

module.exports = Address;