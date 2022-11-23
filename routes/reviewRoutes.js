const express = require('express');
const {
	createReview,
	getAllReviews
} = require('../controllers/reviewController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.post(protect, createReview)
	.get(protect, getAllReviews);

module.exports = router;
