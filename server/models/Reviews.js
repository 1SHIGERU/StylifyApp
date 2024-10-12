const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Transaction = require('./Transaction');

const Review = sequelize.define('Review', {
    reviewID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transactionID: { type: DataTypes.INTEGER, allowNull: false },
    reviewerID: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'userID',
        },
    },
    reviewedID: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'userID',
        },
    },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.STRING },
    createdDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Review.belongsTo(User, { foreignKey: 'reviewerID', as: 'Reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewedID', as: 'Reviewed' });
Review.belongsTo(Transaction, { foreignKey: 'transactionID', as: 'Transaction' });

