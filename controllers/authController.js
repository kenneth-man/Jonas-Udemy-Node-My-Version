const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
	return jwt.sign(
		{ id },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN }
	);
};

exports.signup = catchAsync(async (req, res, next) => {
	const { name, email, password, passwordConfirm } = req.body;

	const newUser = await User.create({
		name,
		email,
		password,
		passwordConfirm
	});

	// creating a json web token;
	// payload, jwt secret and options
	const token = signToken(newUser._id);

	// login a new user by sending jwt token 
	res.status(201).json({
		status: 'Success',
		token,
		data: {
			user: newUser
		}
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1) Check if email and password exists
	if (!email || !password) {
		return next(
			new AppError(
				'Please provide email and password',
				400
			)
		);
	}

	// 2) Check if user exists && password is correct
	// 'password' property is not included in document by default (because 'select: false' in schema);
	// explicitly getting the 'password' in order to use it here
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(
			new AppError(
				'Incorrect email or password',
				401
			)
		);
	}

	// 3) Send token to client
	const token = signToken(user._id);
	res.status(200).json({
		status: 'success',
		token
	})
});
