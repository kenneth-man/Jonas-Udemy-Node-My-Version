const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// 3rd param 'next' calls next middlware in middleware stack
exports.aliasTopTours = (req, res, next) => {
	// prefilling the query string for the user
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
}

exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create(req.body);

		// 'status()' sends a code with the res
		// '.json()' ends the 'req res cycle', sending back json in the res
		res
			.status(201)
			.json({
				status: 'success',
				data: {
					tour: newTour
				}
			});
	} catch (err) {
		res
			.status(400)
			.json({
				status: 'fail',
				message: err
			});
	}
};

exports.getAllTours = async (req, res) => {
	try {
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
	} catch (err) {
		res
			.status(404)
			.json({
				status: 'fail',
				message: err
			});
	}
};

exports.getTour = async (req, res) => {
	try {
		// in tourRoutes.js, an 'id' dynamic parameter is defined in '.route('/:id')'
		const tour = await Tour.findById(req.params.id);

		res
			.status(200)
			.json({
				status: 'success',
				data: {
					tour
				}
			});
	} catch (err) {
		res
			.status(404)
			.json({
				status: 'fail',
				message: err
			});
	}
};

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		
		res
			.status(200)
			.json({
				status: 'success',
				data: {
					tour
				}
			});
	} catch(err){
		res
			.status(404)
			.json({
				status: 'fail',
				message: err
			});
	}
};

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);
		
		res
			.status(204)
			.json({
				status: 'success',
				data: null
			});
	} catch(err){
		res
			.status(404)
			.json({
				status: 'fail',
				message: err
			});
	}
};

// using mongodb aggregation pipeline; keys/properties with leading '$' are mongodb operators
exports.getTourStats = async (req, res) => {
	try {
		const stats = await Tour.aggregate([
			{
				$match: {
					ratingsAverage: {
						$gte: 4.5
					}
				}
			},
			{
				$group: {
					// _id: null,
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
			// {
			// 	$match: {
			// 		_id: {
			// 			$ne: 'easy'
			// 		}
			// 	}
			// }
		]);

		res
			.status(200)
			.json({
				status: 'success',
				data: {
					stats
				}
			});
	} catch(err){
		res
			.status(404)
			.json({
				status: 'fail',
				message: err
			});
	}
}
