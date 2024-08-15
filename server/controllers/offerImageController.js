const OfferImage = require('../models/OfferImage');
const Offer = require('../models/Offer');
const { validationResult } = require('express-validator');
var cloudinary = require('cloudinary').v2;
const ColorThief = require('color-thief-node');
const fs = require('fs');

cloudinary.config({ 
  cloud_name: 'dafhtxlhb', 
  api_key: '849693283372593', 
  api_secret: 'VxfVeeQpQleSMuHEN4ENWA8VW90'
});


exports.createOfferImage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { offerID } = req.body;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: 'No files were uploaded.' });
  }

  const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];  // assuming 'images' is the field name in the form

  try {
    const uploadPromises = files.map(file => cloudinary.uploader.upload(file.tempFilePath));
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);

    const newOfferImages = await Promise.all(imageUrls.map(imageUrl => OfferImage.create({
      offerID,
      imageUrl,
    })));
    
    res.json(newOfferImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getOfferImages = async (req, res) => {
  try {
    const offerImages = await OfferImage.findAll();
    res.json(offerImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getOfferImageById = async (req, res) => {
  const { id } = req.params;

  try {
    const offerImage = await OfferImage.findByPk(id);
    if (!offerImage) {
      return res.status(404).json({ msg: 'OfferImage not found' });
    }
    res.json(offerImage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateOfferImage = async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  try {
    let offerImage = await OfferImage.findByPk(id);
    if (!offerImage) {
      return res.status(404).json({ msg: 'OfferImage not found' });
    }

    offerImage.imageUrl = imageUrl || offerImage.imageUrl;

    await offerImage.save();
    res.json(offerImage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteOfferImage = async (req, res) => {
  const { id } = req.params;

  try {
    const offerImage = await OfferImage.findByPk(id);
    if (!offerImage) {
      return res.status(404).json({ msg: 'OfferImage not found' });
    }

    await offerImage.destroy();
    res.json({ msg: 'OfferImage removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};