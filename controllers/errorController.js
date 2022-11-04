// by specifying 4 parameters, express recognizes this as an error handling middleware function
module.exports = (error, req, res, next) => {
	const { statusCode, status, message } = error;

	statusCode = statusCode || 500;
	status = status || 'error';

	res.status(statusCode).json({
		status,
		message
	})
};
