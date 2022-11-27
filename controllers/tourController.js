const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
	createOne,
	getOne,
	getAll,
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

exports.getTour = getOne(Tour, { path: 'reviews' });

exports.getAllTours = getAll(Tour);

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
	let { distance, latlng, unit } = req.params;
	let [lat, lng] = latlng.split(',');

	if (!lat || !lng) {
		next(
			new AppError(
				`Missing 'lat' and 'lng' query params`,
				400
			)
		);
	}

	if (unit !== 'miles' || unit !== 'km') {
		next(
			new AppError(
				`Unit can only be 'miles' or 'km'`,
				400
			)
		);
	}

	distance = distance || 10;

	const earthRadiusMiles = 3963.2;
	const earthRadiusKms = 6378.1;
	// mongodb expects radius to be in radians; distance / radius
	const radius = distance / (unit === 'miles' ? earthRadiusMiles : earthRadiusKms);

	// geospatial query filter object
	const tours = await Tour.find({
		startLocation: {
			$geoWithin: {
				$centerSphere: [
					[lng, lat],
					radius
				]
			}
		}
	});

	res
		.status(200)
		.json({
			status: 'success',
			results: tours.length,
			data: tours
		});
});

exports.getDistances = catchAsync(async (req, res, next) => {
	let { latlng, unit } = req.params;
	let [lat, lng] = latlng.split(',');

	if (!lat || !lng) {
		next(
			new AppError(
				`Missing 'lat' and 'lng' query params`,
				400
			)
		);
	}

	if (unit !== 'miles' || unit !== 'km') {
		next(
			new AppError(
				`Unit can only be 'miles' or 'km'`,
				400
			)
		);
	}

	// convert distance to 'miles' or 'km' in 'distanceMulitplier' property
	const multiplier = unit === 'miles' ? 0.000621371 : 0.001;

	// use aggregation pipelines when peforming calculations
	const distances = await Tour.aggregate([
		{
			// '$geoNear' stage must be the first aggregation stage if used
			// automatically uses 'geospatial queries' index if only one exists; if multiple, specify using 'key' property
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [Number(lng), Number(lat)]
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: {
				distance: 1,
				name: 1
			}
		}
	]);

	res
		.status(200)
		.json({
			status: 'success',
			data: distances
		});
});
