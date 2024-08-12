const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

router.post('/create', transactionsController.createTransaction);
router.put('/close', transactionsController.closeTransaction);
router.get('/orders/:userID', transactionsController.getActiveTransactions);
router.get('/history/:userID', transactionsController.getClosedTransactions);
router.get('/countTransactions/:userID', transactionsController.countTransactionsByUserID);
router.get('/sumTransactions/:userID', transactionsController.sumTransactionsByUserID);

module.exports = router;