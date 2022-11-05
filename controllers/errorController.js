const setErrorObject = (error, res) => {
	// Operational, trusted error: send message to client
	if (error.isOperational) {
		let conditionalErrorObject;
		const { status, statusCode } = error;

		status = status || 'error';
		statusCode = statusCode || 500;

		if (process.env.NODE_ENV === 'development') {
			const { message, stack } = error;
			
			conditionalErrorObject = {
				status,
				error,
				message,
				stack
			}
		}

		if (process.env.NODE_ENV === 'production') {
			conditionalErrorObject = {
				status,
				message
			}
				
		}

		res.status(statusCode).json(conditionalErrorObject);

		return;
	}

	console.error('Error: ', error);

	// Programming or unknown error: don't leak error details or vulnerabilities
	// send generic error message to client
	res.status(500).json({
		status: 'Error',
		message: 'Something went very wrong'
	});
}

// by specifying 4 parameters, express recognizes this as an error handling middleware function
module.exports = (error, req, res, next) => {
	setErrorObject(error, res);
};
