const express = require('express');
const {
	createReview,
	getReview,
	getAllReviews,
	updateReview,
	deleteReview,
	setTourUserIds
} = require('../controllers/reviewController');
const {
	protect,
	restrictTo
} = require('../controllers/authController');

const router = express.Router(
	// in order to access params that are not specified for this route
	// e.g. accessing ':tourId' param in '/:tourId/reviews' within the 'tourRouter' (tourRoutes.js)
	{
		mergeParams: true
	}
);

router.use(protect);

router
	.route('/')
	.get(getAllReviews)
	.post(restrictTo('user'), setTourUserIds, createReview);

router
	.route('/:id')
	.get(getReview)
	.patch(restrictTo('admin'), updateReview)
	.delete(restrictTo('admin'), deleteReview);

module.exports = router;
