const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const Joi = require('@hapi/joi');

const login_schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required()
});


const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, firstName, familyName } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(404).json({ msg: 'The user with specified email address already exists' });
    }

    let user1 = await User.findOne({ where: { username } });
    if (user1) {
      return res.status(405).json({ msg: 'The user with specified username address already exists' });
    }
    
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt); 

    user = await User.create({ username, email, password: hashedPassword, firstName, familyName });
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


const login = async (req, res) => {

  const { error } = login_schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ msg: 'Such an account not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.userID
      }
    };

    const accessToken = jwt.sign(payload, 'accessTokenSecret', { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, 'refreshTokenSecret', { expiresIn: '7d' });

    res.json({ accessToken, refreshToken })
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Unable to logout');
    }
    res.send('Logout successful');
  });
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    const userId = decoded.user.id;
    
    let user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    const payload = {
      user: {
        id: user.userID
      }
    };

    const accessToken = jwt.sign(payload, 'accessTokenSecret', { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


module.exports = {
  register,
  login,
  logout,
  getUser,
  refreshToken
};