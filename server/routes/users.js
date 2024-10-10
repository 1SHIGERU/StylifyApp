// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/add', userController.addUser);
router.post('/update', userController.updateInfo);
router.get('/all', userController.getAllUsers);
router.get('/user/:id', userController.getUserById);
router.get('/balance/:id', userController.getBalance);

//ULUBIONE
router.post('/addFavourite', userController.addFavorite);
router.get('/getFavourites/:id', userController.getFavourites);
router.delete('/deleteFavourite', userController.deleteFavorite);

//ADRESY
router.get('/getAddress/:id', userController.getAddresses);
router.put('/updateAddress', userController.updateAddress);
router.get('/ifAddressSet/:id', userController.ifAddressSet);


module.exports = router;
