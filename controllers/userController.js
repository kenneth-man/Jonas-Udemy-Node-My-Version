const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObject = (object, ...persistedFields) => {
	const filteredObject = {};

	Object.keys(object).forEach(curr => {
		if (persistedFields.includes(curr)) {
			filteredObject[curr] = object[curr]
		}
	});

	return filteredObject;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	res
		.status(200)
		.json({
			status: 'success',
			results: users.length,
			data: {
				users
			}
		});
});

exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Throw error if a user tries to update password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword',
				400
			)
		)
	}

	// 2) Update the user document
	// only allow the 'name' and 'email' properties to be updateable on a user document
	const filteredBody = filterObject(req.body, 'name', 'email');

	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		filteredBody,
		{
			new: true,
			runValidators: true
		});

	res
		.status(200)
		.json({
			status: 'success',
			data: {
				user: updatedUser
			}
		});
});

// not deleting document, but setting 'active: false'
// then not selecting 'active: false 'documents in user document pre query hook
exports.deleteMe = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.user.id,
		{
			active: false
		}
	);

	res
		.status(204)
		.json({
			status: 'succes',
			data: null
		});
});

exports.getUser = (req, res) => {
	res	
		.status(500)
		.json({
			status: 'error',
			message: 'This routes is not yet defined'
		});
};

exports.createUser = (req, res) => {
	res	
		.status(500)
		.json({
			status: 'error',
			message: 'This routes is not yet defined'
		});
};

exports.updateUser = (req, res) => {
	res	
		.status(500)
		.json({
			status: 'error',
			message: 'This routes is not yet defined'
		});
};

exports.deleteUser = (req, res) => {
	res	
		.status(500)
		.json({
			status: 'error',
			message: 'This routes is not yet defined'
		});
};
