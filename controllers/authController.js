const { promisify } = require('util');
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

// protected route (if current user is logged in)
exports.protect = catchAsync(async (req, res, next) => {
	let token;
	const requestHeader = req.headers;

	// 1) Getting token and checking if it exists;
	// code convention to create a header in request called 'authorization'
	// and the value being a string 'Bearer [...token goes here...]'
	if (requestHeader.authorization && requestHeader.authorization.startsWith('Bearer')) {
		token = requestHeader.authorization.split(' ')[1];
	}

	if (!token) {
		return next(
			new AppError(
				'You are not logged in. Please log in to gain access',
				401
			)
		);
	}

	// 2) checking if token is valid and if payload/token has not been altered
	// if payload has been altered, token would be altered, failing verify
	const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const user = await User.findById(decodedToken.id);

	if (!user) {
		return next(
			new AppError(
				'The user belonging to this token no longer exists',
				401
			)
		);
	}

	// 4) Check if user changed password after the token was issued
	// 'iat' means 'issued at token'
	if (user.changedPassword(decodedToken.iat)) {
		return next(
			new AppError(
				'This user recently changed their password. Please log in again',
				401
			)
		);
	}

	// put entire user data into request object in 'user' prop (express)
	// if we want to pass data from middleware to middleware, add props to the 'req' object
	req.user = user;

	next();
});

// if the user's 'role' is not included in the arguments, they don't have access (throw error)
// Express automatically passes the 3 arguments req, res, next for middleware functions
exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					'You do not have permission to perform this action',
					403
				)
			);
		}

		next();
	}
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) get user based by email
	const user = await User.findOne({
		email: req.body.email
	});

	if (!user) {
		return next(
			new AppError(
				'There is no user with that email address',
				404
			)
		);
	}

	// 2) generate the random reset token
	const resetToken = user.createPasswordResetToken();

	// don't require validation for this document save
	await user.save({
		validateBeforeSave: false
	});

	// 3) send the token to user's email
});

exports.resetPassword = (req, res, next) => {

}
