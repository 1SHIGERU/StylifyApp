const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const notificationController = require('../controllers/notificationController');

router.post('/create', notificationController.createNotification);
router.put('/set-read', notificationController.setRead);
router.get('/:id', notificationController.getNotifications);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
