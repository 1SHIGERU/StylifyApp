const express = require('express');
const router = express.Router();

const reviewsController = require('../controllers/reviewsController');

router.get('/:id', reviewsController.getReviewsByUserID);
router.post('/', reviewsController.addReview);
router.get('/average/:id', reviewsController.getAverageRating);

module.exports = router;