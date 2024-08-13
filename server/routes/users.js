// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/add', userController.addUser);
router.get('/all', userController.getAllUsers);
router.get('/user/:id', userController.getUserById);
router.get('/balance/:id', userController.getBalance);

//ULUBIONE
router.post('/addFavourite', userController.addFavorite);
router.get('/getFavourites/:id', userController.getFavourites);
router.delete('/deleteFavourite', userController.deleteFavorite);

//ADRESY
router.post('/addAddress', userController.addAddress);
router.get('/getAddresses/:id', userController.getAddresses);
router.patch('/updateAddress', userController.updateAddress);


module.exports = router;
