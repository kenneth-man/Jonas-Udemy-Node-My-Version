const { catchAsync } = require('./catchAsync');
const { AppError } = require('./appError');
const APIFeatures = require('./utils/apiFeatures');

// refactoring duplicate controller functions into resuable util functions...

exports.createOne = (Model) => catchAsync(async (req, res, next) => {
	const document = await Model.create(req.body);

	// sending back json in the res; 'status()' sends a code with the res
	// '.json()' ends the 'req res cycle'
	res
		.status(201)
		.json({
			status: 'success',
			data: document
		});
}); 

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
	let query = Model.findById(req.params.id);

	if (populateOptions) {
		query = query.populate(populateOptions);
	}
	
	const document = await query;

	if (!document) {
		return next(
			new AppError(
				'No Document found with a matching ID',
				404
			)
		);
	}

	res
		.status(200)
		.json({
			status: 'success',
			data: document
		});
});

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
	// to allow for nested GET reviews on Tour
	let filter = {};

	if (req.params.tourId) {
		filter = {
			tour: req.params.tourId
		};
	};

	// BUILD QUERY
	const features = new APIFeatures(Model.find(filter), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();

	// EXECUTE QUERY
	const document = await features.query;

	// SEND RESPONSE
	res
		.status(200)
		.json({
			status: 'success',
			results: document.length,
			data: document
		});
});

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
	const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		// enable built in mongoose validators
		runValidators: true
	});

	if (!document) {
		return next(
			new AppError(
				'No Document found with a matching ID',
				404
			)
		);
	}
	
	res
		.status(200)
		.json({
			status: 'success',
			data: document
		});
});

exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
	const document = await Model.findByIdAndDelete(req.params.id);

	if (!document) {
		return next(
			new AppError(
				'No Document found with a matching ID',
				404
			)
		);
	}
		
	res
		.status(204)
		.json({
			status: 'success',
			data: null
		});
});
