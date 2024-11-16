const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const offerController = require('../controllers/offerController');

router.post(
  '/',
  [
    check('ownerID', 'Owner ID is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('price', 'Price is required').isFloat(),
  ],
  offerController.createOffer
);
router.get('/countOffersByCategory', offerController.countOffersByCategory);
router.post('/deactivate', offerController.deactivateOffer);
router.get('/', offerController.getOffers);
router.get('/:id', offerController.getOfferById);
router.get('/userID/:userID', offerController.getOffersByUserId);
router.put('/:id', offerController.updateOffer);
router.delete('/:id', offerController.deleteOffer);
router.get('/countOffers/:userID', offerController.countActiveOffersByUserID);



module.exports = router;