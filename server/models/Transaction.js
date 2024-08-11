const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Offer = require('./Offer');

const Transaction = sequelize.define('Transaction', {
  transactionID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seller: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userID',
    },
  },
  buyer: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userID',
    },
  },
  offer: {
    type: DataTypes.INTEGER,
    references: {
      model: Offer,
      key: 'offerID',
    },
  },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  createdDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  isClosed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

Transaction.belongsTo(User, { foreignKey: 'seller', as: 'Seller' });
Transaction.belongsTo(User, { foreignKey: 'buyer', as: 'Buyer' });
Transaction.belongsTo(Offer, { foreignKey: 'offer', as: 'Offer' });

module.exports = Transaction;