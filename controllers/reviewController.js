const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const {
	createOne,
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

exports.getAllReviews = catchAsync(async (req, res, next) => {
	let filter = {};

	if (req.params.tourId) {
		filter = {
			tour: req.params.tourId
		};
	};

	const reviews = await Review.find(filter);

	res
		.status(200)
		.json({
			status: 'success',
			results: reviews.length,
			data: {
				reviews
			}
		});
});

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);
