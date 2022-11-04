class AppError extends Error {
	// constructor called when an instance is created of this class
	constructor(message, statusCode) {
		// when extending a parent class, call 'super()' to call parent constructor
		// e.g. similar to calling 'Error(message)'; sets 'message' property which this class has access to
		super(message);

		this.statusCode = statusCode;
		this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;

		// create a property called 'stack' on the error object to contain the error stacktrace 
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
