const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Offer = require('../models/Offer');
const { Sequelize } = require('sequelize');


exports.createTransaction = async (req, res) => {
  try {
      const { seller, buyer, offer, amount } = req.body;

      if (!seller || !buyer || !offer || !amount) {
          return res.status(400).json({ error: 'Seller, buyer, offer, and amount are required.' });
      }

      const existingTransaction = await Transaction.findOne({
        where: {
          seller,
          buyer,
          offer,
          isClosed: false,
        }
      });
  
      if (existingTransaction) {
        return res.status(400).json({ error: 'Transaction already exists.' });
      }
      const newTransaction = await Transaction.create({
          seller,
          buyer,
          offer,
          amount,
      });

      console.log('Transaction created successfully:', newTransaction);

      res.status(201).json(newTransaction);
  } catch (err) {
      console.error('Error creating transaction:', err.message);
      res.status(500).send('Server Error (transactionsController)');
  }
};

exports.closeTransaction = async (req, res) => {
  try {
      const { transactionID, isClosed } = req.body;

      const transaction = await Transaction.findByPk(transactionID);

      if (!transaction) {
          return res.status(404).json({ error: 'Transaction not found.' });
      }

      transaction.isClosed = isClosed;
      await transaction.save();

      res.status(200).json(transaction);
  } catch (err) {
      console.error('Error closing transaction:', err.message);
      res.status(500).send('Server Error');
  }
};

exports.getActiveTransactions = async (req, res) => {
  try {
      const userID = req.params.userID;

      const transactions = await Transaction.findAll({
          where: {
              [Sequelize.Op.or]: [
                  { seller: userID },
                  { buyer: userID },
              ],
              isClosed: false,
          },
          include: [
              { model: User, as: 'Seller', attributes: ['username'] },
              { model: User, as: 'Buyer', attributes: ['username'] },
              { model: Offer, as: 'Offer', attributes: ['title'] },
          ],
      });

      res.status(200).json(transactions);
  } catch (err) {
      console.error('Error fetching user transactions:', err.message);
      res.status(500).send('Server Error');
  }
};

exports.getClosedTransactions = async (req, res) => {
  try {
      const userID = req.params.userID;

      const transactions = await Transaction.findAll({
          where: {
              [Sequelize.Op.or]: [
                  { seller: userID },
                  { buyer: userID },
              ],
              isClosed: true,
          },
          include: [
              { model: User, as: 'Seller', attributes: ['username'] },
              { model: User, as: 'Buyer', attributes: ['username'] },
              { model: Offer, as: 'Offer', attributes: ['title'] },
          ],
      });

      res.status(200).json(transactions);
  } catch (err) {
      console.error('Error fetching user transactions:', err.message);
      res.status(500).send('Server Error');
  }
}


exports.countTransactionsByUserID = async (req, res) => {
    try {
        const userID = req.params.userID;

        const soldCount = await Transaction.count({
            where: {
                seller: userID,
                isClosed: true,
            },
        });

        const boughtCount = await Transaction.count({
            where: {
                buyer: userID,
                isClosed: true,
            },
        });

        res.status(200).json({
            soldCount,
            boughtCount,
        });
    } catch (err) {
        console.error('Error counting user transactions:', err.message);
        res.status(500).send('Server Error');
    }
}

  