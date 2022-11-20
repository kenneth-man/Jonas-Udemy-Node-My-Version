const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// --- GLOBAL MIDDLEWARES ---
// adding Security HTTP Headers to req and res
app.use(helmet());

// development mode logging
if (process.env.NODE_ENV === 'development') {
	// applying middleware to all routes; middleware is anything that modifies the req or res object;
	// if middleware is declared after routes, they will not be applied during 'req res cycle'
	app.use(morgan('dev'));
}

// limit 100 requests from the same IP address per hour
const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

// body parser; reading data from body into req.body
app.use(express.json({
	limit: '10kb'
}));

// data sanitization against NoSQL query injections
app.use(mongoSanitize());

// data sanitization against XSS (Cross Site Scripting) attacks
app.use(xss());

// removes duplicate query params; can whitelist certain parameters to allow duplicates
app.use(hpp({
	whitelist: [
		'duration',
		'ratingsQuantity',
		'ratingsAverage',
		'maxGroupSize',
		'difficulty',
		'price'
	]
}));

// serving static files to browser; pass in the directory which will be the root '/'
app.use(express.static(`${__dirname}/public`));

// example middleware
app.use((req, res, next) => {
	// adding a property to the req object
	req.requestTime = new Date().toISOString();

	// move onto the next middleware in the middleware stack of the 'req res cycle'
	next();
});

// applying middleware to only specific routes; mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// handling all unknown routes
app.all('*', (req, res, next) => {
	// passing an argument into 'next()' skips all subsequent middleware and goes to the error middleware
	next(
		new AppError(
			`Can't find ${req.originalUrl} on this server`,
			404
		)
	);
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
