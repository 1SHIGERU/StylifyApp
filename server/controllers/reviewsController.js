const Reviews = require('../models/Reviews');
const User = require('../models/User');
const { Sequelize } = require('sequelize');

exports.getReviewsByUserID = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Reviews.findAll({
            where: {
                reviewedID: id,
            },
            include: [
                {
                    model: User,
                    as: 'Reviewer',
                    attributes: ['firstName', 'username','avatarURL', 'userID'],
                },
            ],
        });

        if (!reviews) {
            return res.status(404).json({ error: 'No reviews found.' });
        }

        res.status(200).json(reviews);
    } catch (err) {
        console.error('Error getting reviews:', err.message);
        res.status(500).send('Server Error (reviewsController)');
    }
}

exports.addReview = async (req, res) => {
    try {
        const { transactionID, reviewerID, reviewedID, rating, comment } = req.body;

        const review = await Reviews.create({
            transactionID,
            reviewerID,
            reviewedID,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (err) {
        console.error('Error adding review:', err.message);
        res.status(500).send('Server Error (reviewsController)');
    }
}

exports.getAverageRating = async (req, res) => {
    try {
        const { id } = req.params;

        const averageRating = await Reviews.findAll({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating'],
            ],
            where: {
                reviewedID: id,
            },
        });

        if (!averageRating) {
            return res.status(404).json({ error: 'No reviews found.' });
        }

        res.status(200).json(averageRating);
    } catch (err) {
        console.error('Error getting average rating:', err.message);
        res.status(500).send('Server Error (reviewsController)');
    }
}