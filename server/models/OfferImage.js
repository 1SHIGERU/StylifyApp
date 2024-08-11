const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Offer = require('../models/Offer');

const OfferImage = sequelize.define('OfferImage', {
    imageID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    offerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Offer,
            key: 'offerID',
        },
    },
    imageUrl: { type: DataTypes.STRING, allowNull: false }
});

// Definiowanie relacji
Offer.hasMany(OfferImage, {
    foreignKey: 'offerID',
    onDelete: 'CASCADE' 
});

OfferImage.belongsTo(Offer, {
    foreignKey: 'offerID',
    onDelete: 'CASCADE'
});

module.exports = OfferImage;
