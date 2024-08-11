const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.createCheckoutSession);
router.get('/checkout/:id', paymentController.getCheckoutSession);

module.exports = router;