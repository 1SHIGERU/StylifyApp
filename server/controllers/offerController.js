const Favourite = require('../models/Favourite');
const Offer = require('../models/Offer');
const OfferImage = require('../models/OfferImage');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.createOffer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { ownerID, title, description, price, category, gender, colors, size  } = req.body;

  console.log(gender, colors, size);

  try {
    const newOffer = await Offer.create({
      ownerID,
      title,
      description,
      price,
      category,
      gender,
      colors,
      size,

    });
    res.json(newOffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server Error ${err.message}`);
  }
};

exports.getOffers = async (req, res) => {

  let filter = { where: { isActive: true } };
  
  const { userId, minPrice, maxPrice, category, size, gender, colors } = req.query;
  console.log('query', req.query);
  if (userId) {
    filter.where.ownerID = userId;
  }

  if (minPrice && maxPrice) {
    filter.where.price = { [Op.between]: [minPrice, maxPrice] }; 
  } else if (minPrice) {
    filter.where.price = { [Op.gte]: minPrice }; 
  } else if (maxPrice) {
    filter.where.price = { [Op.lte]: maxPrice }; 
  }

  if (category) {
    filter.where.category = category;
  }

  if (size) {
    const sizesArray = size.split(',');
    filter.where.size = { [Op.or]: sizesArray.map((s) => ({ [Op.iLike]: `%${s}%` })) };
  }
  
  if (colors) {
    const colorsArray = colors.split(',');
    filter.where.colors = { [Op.or]: colorsArray.map((c) => ({ [Op.iLike]: `%${c}%` })) };
  }

  if (gender) {
    filter.where.gender = gender;
  }

  try {
    const offers = await Offer.findAll({
      ...filter,
      include: {
        model: OfferImage,
        attributes: ['imageUrl'],
      },
    });

    const cheapestOffer = await Offer.findOne({
      where: filter.where,
      order: [['price', 'ASC']],
      limit: 1
    });

    const mostExpensiveOffer = await Offer.findOne({
      where: filter.where,
      order: [['price', 'DESC']], 
      limit: 1
    });

    res.json({
      offers,
      cheapestPrice: cheapestOffer ? cheapestOffer.price : null,
      mostExpensivePrice: mostExpensiveOffer ? mostExpensiveOffer.price : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


  exports.deactivateOffer = async (req, res) => {
    try {
      const { offerId } = req.body;
  
      const offer = await Offer.findByPk(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
  
      offer.isActive = false;
      await offer.save();
  
      res.status(200).json({ message: 'Offer deactivated successfully.' });
    } catch (err) {
      console.error('Error deactivating offer:', err.message);
      res.status(500).send('Server Error');
    }
  };
  
  exports.getOfferById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const offer = await Offer.findByPk(id, {
        include: {
          model: OfferImage,
          attributes: ['imageUrl'],
        },
      });
      if (!offer) {
        return res.status(404).json({ msg: 'Offer not found' });
      }
      res.json(offer);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

exports.getOffersByUserId = async (req, res) => {
  const { userID } = req.params;

  try {
    const offers = await Offer.findAll({
      where: {
        ownerID: userID,
        isActive: true,
      },
      include: {
        model: OfferImage,
        attributes: ['imageUrl'],
      },
    });
    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateOffer = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, isActive } = req.body;

  try {
    let offer = await Offer.findByPk(id);
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }

    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.price = price || offer.price;
    offer.category = category || offer.category;
    offer.isActive = isActive !== undefined ? isActive : offer.isActive;

    await offer.save();
    res.json(offer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteOffer = async (req, res) => {
  const { id } = req.params;

  try {
    const offer = await Offer.findByPk(id);
    const favourites = await Favourite.findAll({ where: { offerID: id } });
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }
    await Promise.all(favourites.map((favourite) => favourite.destroy()));
    await offer.destroy();
    res.json({ msg: 'Offer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.countActiveOffersByUserID = async (req, res) => {
  const { userID } = req.params;
  try {
    const count = await Offer.count({
      where: {
        ownerID: userID,
        isActive: true,
      },
    });
    res.json(count);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

