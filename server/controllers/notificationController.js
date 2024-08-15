const Notification = require('../models/Notification');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.createNotification = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userID, type, message } = req.body;

        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const notification = await Notification.create({
            type,
            message,
            userID,
        });

        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: {
                userID: req.params.id
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
    
}

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        await notification.destroy();
        res.json({ msg: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}

exports.setRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.body.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
}

