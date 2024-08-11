const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const { register, login, logout, getUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { refreshToken } = require('../controllers/authController');

// Register User
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').not().isEmpty(),
  check('firstName', 'First name is required').not().isEmpty(),
  check('familyName', 'Family name is required').not().isEmpty()
], register);

// Login User
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], login);

// Logout User
router.post('/logout', auth, logout);
// Refresh token
router.post('/refresh-token', refreshToken);
// Get User Data
router.get('/user', auth, getUser);

module.exports = router;