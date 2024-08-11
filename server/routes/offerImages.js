const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const offerImageController = require('../controllers/offerImageController');

router.post(
  '/',
  [
    check('offerID', 'Offer ID is required').not().isEmpty(),
  ],
  offerImageController.createOfferImage
);

router.get('/', offerImageController.getOfferImages);
router.get('/:id', offerImageController.getOfferImageById);
router.put('/:id', offerImageController.updateOfferImage);
router.delete('/:id', offerImageController.deleteOfferImage);

module.exports = router;