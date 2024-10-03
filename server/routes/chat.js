const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');

router.post('/create', chatController.createChat);
router.get('/:id', chatController.getMessagesByChatID);
router.get('/user/:id', chatController.getUserChats);
router.post('/add-message', chatController.sendMessage);

module.exports = router;

