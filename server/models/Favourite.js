const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Offer = require('./Offer');

const Favourite = sequelize.define('Favourite', {
  favouriteID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'userID',
    },
  },
  offerID: {
    type: DataTypes.INTEGER,
    references: {
      model: Offer,
      key: 'offerID',
    },
  },
});

Favourite.belongsTo(Offer, { foreignKey: 'offerID', onDelete: 'CASCADE' });

module.exports = Favourite;