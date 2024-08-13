const User = require('../models/User');
const Favourite = require('../models/Favourite');
const Offer = require('../models/Offer');
const OfferImage = require('../models/OfferImage');
const Address = require('../models/Address');

exports.addUser = async (req, res) => {
  try {
    const { username, password, email, isAdmin, firstName, familyName, balance } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required.' });
    }

    const newUser = await User.create({
      username,
      password,
      email,
      isAdmin,
      firstName,
      familyName,
      balance,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server Error');
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user.balance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}







exports.addFavorite = async (req, res) => {
  const { userID, offerID } = req.body;
  try {
    const favourite = await Favourite.create({ userID, offerID });
    res.status(201).json(favourite);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favourite' });
  }
};

exports.deleteFavorite = async (req, res) => {
  const { userID, offerID } = req.body;
  try {
    console.log('Received request to delete favourite with userID:', userID, 'and offerID:', offerID);
    const favourite = await Favourite.findOne({
      where: {
        userID: userID,
        offerID: offerID,
      },
    });
    if (!favourite) {
      return res.status(404).json({ error: 'Favourite not found' });
    }
    await favourite.destroy();
    res.json({ message: 'Favourite deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete favourite' });
  }
}

exports.getFavourites = async (req, res) => {
  const { id } = req.params;
  try {
    const favourites = await Favourite.findAll({
      where: { userID: id },
      include: {
        model: Offer,
        where: { isActive: true },
        include: {
          model: OfferImage,
          attributes: ['imageUrl'],
        },
      },
    });
    res.json(favourites);
  } catch (error) {
    console.error('Error getting favourites:', error.message);
    res.status(500).json({ error: 'Failed to get favourites' });
  }
}











exports.getAddresses = async (req, res) => {
  const { id } = req.params;
  try {
    const addresses = await Address.findAll({ where: { userID: id } });
    res.json(addresses);
  } catch (error) {
    console.error('Error getting addresses:', error.message);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { userID, street, city, postcode, country } = req.body;

    let address = await Address.findOne({ where: { userID } });

    if (!address) {
      address = await Address.create({ userID, street, city, postcode, country });
    } else {
      await address.update({ street, city, postcode, country });
    }

    res.status(200).json(address);
  } catch (err) {
    console.error('Error updating address:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.ifAddressSet = async (req, res) => {
  const { id } = req.params;
  try {
    const address = await Address.findOne({ where: { userID: id } });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json({ message: 'Address exists' });
  } catch (err) {
    console.error('Error checking address:', err.message);
    res.status(500).send('Server Error');
  }
};


 
