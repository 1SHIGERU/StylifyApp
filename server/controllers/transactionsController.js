const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Offer = require('../models/Offer');
const OfferImage = require('../models/OfferImage');
const Address = require('../models/Address');
const Notification = require('../models/Notification');
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
  
      if (transaction.isClosed) {
        return res.status(400).json({ error: 'Transaction is already closed.' });
      }
  
      const seller = await User.findByPk(transaction.seller);
      console.log('Seller:', seller);
      if (!seller) {
        return res.status(404).json({ error: 'Seller not found.' });
      }
  
      seller.balance += transaction.amount;
      await seller.save();
  
      transaction.isClosed = isClosed;
      await transaction.save();
  
      res.status(200).json(transaction);
    } catch (err) {
      console.error('Error closing transaction:', err.message);
      res.status(500).send('Server Error');
    }
  };

  exports.changeStatus = async (req, res) => {
    try {
      const { transactionID, status } = req.body;

      const transaction = await Transaction.findByPk(transactionID, {
        include: [
            {
                model: Offer,
                as: 'Offer',
                attributes: ['title']
            }
        ]
    });


      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found.' });
      }

      transaction.status = status;
      await transaction.save();

      if (status === 'shipped') {
        const buyer = await User.findByPk(transaction.buyer);
        console.log('Buyer:', buyer);
        if (buyer) {
            await Notification.create({
                userID: buyer.userID,
                type: 'info',
                message: `Your item "${transaction.Offer.title}" has been shipped!`,
                isRead: false,
            });
        }
      }

      if(status === 'received') {
        const seller = await User.findByPk(transaction.seller);
        console.log('Seller:', seller);
        if (seller) {
            await Notification.create({
                userID: seller.userID,
                type: 'info',
                message: `Your item "${transaction.Offer.title}" has been received by the buyer! Payment will be processed shortly.`,
                isRead: false,
            });
        }
      }

      res.status(200).json(transaction);
    } catch (err) {
      console.error('Error marking transaction as sent:', err.message);
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
                {
                  model: User,
                  as: 'Seller',
                  attributes: ['username']
                },
                {
                  model: User,
                  as: 'Buyer',
                  attributes: ['username'],
                  include: [
                    {
                      model: Address,
                      as: 'Address',
                      attributes: ['street', 'city', 'postcode', 'country']
                    }
                  ]
                },
                {
                  model: Offer,
                  as: 'Offer',
                  attributes: ['title']
                }
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

exports.sumTransactionsByUserID = async (req, res) => {
    try {
        const userID = req.params.userID;

        const soldSum = await Transaction.sum('amount', {
            where: {
                seller: userID,
                isClosed: true,
            },
        });

        const boughtSum = await Transaction.sum('amount', {
            where: {
                buyer: userID,
                isClosed: true,
            },
        });

        res.status(200).json({
            soldSum,
            boughtSum,
        });
    } catch (err) {
        console.error('Error summing user transactions:', err.message);
        res.status(500).send('Server Error');
    }
}




  