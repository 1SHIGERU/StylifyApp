// routes/moderation.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/moderationController');

// GET pending flags
router.get('/flags', controller.getFlags);

// moderator decision: tp / fp / ban
router.post('/flags/:flagId/mark', controller.markFlag);

// override decision (unblock)
router.post('/flags/:flagId/override', controller.overrideFlag);

module.exports = router;
