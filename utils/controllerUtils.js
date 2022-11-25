const { catchAsync } = require('./catchAsync');
const { AppError } = require('./appError');

// refactoring duplicate controller functions into resuable util functions...

exports.createOne = (Model) => catchAsync(async (req, res, next) => {
	const document = await Model.create(req.body);

	// sending back json in the res; 'status()' sends a code with the res
	// '.json()' ends the 'req res cycle'
	res
		.status(201)
		.json({
			status: 'success',
			data: {
				data: document
			}
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
			data: {
				data: document
			}
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
