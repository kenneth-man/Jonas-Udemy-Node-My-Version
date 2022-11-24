const express = require('express');
const {
	createReview,
	getAllReviews
} = require('../controllers/reviewController');
const { protect } = require('../controllers/authController');

const router = express.Router(
	// in order to access params that are not specified for this route
	// e.g. accessing ':tourId' param in '/:tourId/reviews' within the 'tourRouter' (tourRoutes.js)
	{
		mergeParams: true
	}
);

router
	.route('/')
	.post(protect, createReview)
	.get(protect, getAllReviews);

module.exports = router;
