const express = require('express');
const router = express.Router();
const usersRoutes = require('./users');
const authRoutes = require('./auth');
const paymentRoutes = require('./payment');
const offersRouter = require('./offers');
const offerImagesRouter = require('./offerImages');
const transactionsRouter = require('./transactions');

router.use(express.json());

router.use('/api/auth', authRoutes);
router.use('/payment', paymentRoutes);
router.use('/users', usersRoutes);
router.use('/offers', offersRouter);
router.use('/offerImages', offerImagesRouter);
router.use('/transactions', transactionsRouter);

module.exports = router;