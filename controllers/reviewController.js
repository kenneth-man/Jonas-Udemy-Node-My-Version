const Review = require('../models/reviewModel');
const {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
} = require('../utils/controllerUtils');

exports.setTourUserIds = (req, res, next) => {
	// Allow nested routes
	if (!req.body.tour) {
		req.body.tour = req.params.tourId;
	}

	if (!req.body.user) {
		req.body.user = req.user.id;
	}

	next();
};

exports.createReview = createOne(Review);

exports.getReview = getOne(Review);

exports.getAllReviews = getAll(Review);

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);
