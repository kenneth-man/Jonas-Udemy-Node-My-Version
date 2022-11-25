const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
	createOne,
	updateOne,
	deleteOne
} = require('../utils/controllerUtils');

// 3rd param 'next' calls next middleware in middleware stack
exports.aliasTopTours = (req, res, next) => {
	// default query parameters;
	// prefilling the query string for the user if they didn't specify any parameters
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.createTour = createOne(Tour);

exports.getAllTours = catchAsync(async (req, res, next) => {
	// BUILD QUERY
	const features = new APIFeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();

	// EXECUTE QUERY
	const tours = await features.query;

	// SEND RESPONSE
	res
		.status(200)
		.json({
			status: 'success',
			results: tours.length,
			data: {
				tours
			}
		});
});

exports.getTour = catchAsync(async (req, res, next) => {
	// in tourRoutes.js, an 'id' dynamic parameter is defined in '.route('/:id')'
	const tour = await Tour
		.findById(req.params.id)
		.populate('reviews');

	if (!tour) {
		return next(
			new AppError(
				'No Tour found with a matching ID',
				404
			)
		);
	}

	res
		.status(200)
		.json({
			status: 'success',
			data: {
				tour
			}
		});
});

exports.updateTour = updateOne(Tour);

exports.deleteTour = deleteOne(Tour);

// using mongodb aggregation pipeline; aggregation pipelines are similar to queries but
// consists of one or more 'stages' that processes and manipulates data
// keys/properties with leading '$' are mongodb operators
exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate(
		[
			{
				$match: {
					ratingsAverage: {
						$gte: 4.5
					}
				}
			},
			{
				$group: {
					_id: '$difficulty',
					numTours: {
						$sum: 1
					},
					numRatings: {
						$sum: '$ratingsQuantity'
					},
					avgRating: {
						$avg: '$ratingsAverage'
					},
					avgPrice: {
						$avg: '$price'
					},
					minPrice: {
						$min: '$price'
					},
					maxPrice: {
						$max: '$price'
					}
				}
			},
			{
				$sort: {
					avgPrice: 1
				}
			}
		]
	);

	res
		.status(200)
		.json({
			status: 'success',
			data: {
				stats
			}
		});
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
	const year = Number(req.params.year);
	const plan = await Tour.aggregate(
		[
			{
				$unwind: '$startDates'
			},
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`)
					}
				}
			},
			{
				$group: {
					_id: {
						$month: '$startDates'
					},
					numTourStarts: {
						$sum: 1
					},
					tours: {
						$push: '$name'
					}
				}
			},
			{
				$addFields: {
					month: '$_id'
				}
			},
			{
				$project: {
					_id: 0
				}
			},
			{
				$sort: {
					numTourStarts: -1
				}
			},
			{
				$limit: 12
			}
		]
	);

	res
		.status(200)
		.json({
			status: 'success',
			data: {
				plan
			}
		});
});
