// controllers/userController.js
const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać użytkowników.' });
  }
};

const createUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await User.create({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się utworzyć użytkownika.' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
};
