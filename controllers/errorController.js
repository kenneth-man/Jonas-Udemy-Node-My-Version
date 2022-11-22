const AppError = require('../utils/appError');

// handling invalid database IDs
const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;

	return new AppError(message, 400);
};

// handling duplicate database fields
const handleDuplicateFieldsDB = (err) => {
	// RegEx: Grabbing values between quotation marks
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}. Please use another value`

	return new AppError(message, 400);
};

// handling mongoose validation errors in schema
const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map(curr => curr.message);
	const message = `Invalid input data: ${errors.join('. ')}`;

	return new AppError(message, 400);
};

// JWT token verification error from 'jwt.verify()' in 'authController'
const handleJWTError = (err) => {
	return new AppError(
		`Invalid token: ${err}. Please try logging in again`,
		401
	)
}

// JWT token has expired; duration set in .env as 'JWT_EXPIRES_IN'
const handleJWTExpiredError = (err) => {
	return new AppError(
		`Expired token: ${err}. Please log in again to generate new token`,
		401
	)
}

const setErrorObject = (error, res) => {
	// Operational, trusted error: send message to client
	if (error.isOperational) {
		let conditionalErrorObject;
		let { statusCode } = error;

		statusCode = statusCode || 500;

		if (process.env.NODE_ENV === 'development') {
			let { status, message, stack } = error;

			status = status || 'error';
			
			conditionalErrorObject = {
				status,
				error,
				message,
				stack
			}
		}

		if (process.env.NODE_ENV === 'production') {
			// not good practice to mutate argument values
			let errorCopy = { ...error };

			if (errorCopy.name === 'CastError') {
				errorCopy = handleCastErrorDB(errorCopy);
			}

			if (errorCopy.code === 11000) {
				errorCopy = handleDuplicateFieldsDB(errorCopy);
			}

			if (errorCopy.name === 'ValidationError') {
				errorCopy = handleValidationErrorDB(errorCopy);
			}

			if (errorCopy.name === 'JsonWebTokenError') {
				errorCopy = handleJWTError(errorCopy);
			}

			if (errorCopy.name === 'TokenExpiredError') {
				errorCopy = handleJWTExpiredError(errorCopy);
			}

			conditionalErrorObject = {
				status: errorCopy.status,
				message: errorCopy.message
			}	
		}

		res
			.status(statusCode)
			.json(conditionalErrorObject);

		return;
	}

	// unknown error: send generic error message to client
	// don't leak error details or vulnerabilities
	res
		.status(500)
		.json({
			status: 'Error',
			message: 'Something went very wrong'
		});
}

// by specifying 4 parameters, express recognizes this as an error handling middleware function
module.exports = (error, req, res, next) => {
	setErrorObject(error, res);
};
