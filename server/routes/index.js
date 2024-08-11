const express = require('express');
const router = express.Router();
const userRoutes = require('./users');
const authRoutes = require('./auth');

router.use(express.json());
router.use('/users', userRoutes);
router.use('/api/auth', authRoutes);

module.exports = router;