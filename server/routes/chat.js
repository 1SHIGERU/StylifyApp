const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');

{/* Contact Form */}
router.post('/sendContactMessage', chatController.sendContactMessage);
router.get('/getContactMessages', chatController.getContactMessages);

{/* Chat */}

router.post('/create', chatController.createChat);
router.post('/add-message', chatController.sendMessage);
router.get('/:id', chatController.getMessagesByChatID);
router.get('/user/:id', chatController.getUserChats);
router.post('/setAsRead', chatController.setAsRead);
router.get('/checkUnread/:id', chatController.checkUnreadMessages);
router.get('/:chatID/messages', chatController.getChatMessages);


router.delete('/deleteContactMessage/:id', chatController.deleteContactMessage);


module.exports = router;

