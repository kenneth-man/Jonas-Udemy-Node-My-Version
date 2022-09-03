const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
	// applying middleware to all routes; middleware is anything that modifies the req or res object;
	// if middleware is declared after routes, they will not be applied during 'req res cycle'
	app.use(morgan('dev'));
}

// create an express application
app.use(express.json());

// how to serve static files to browser; pass in the directory which will be the root '/'
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	// adding a property to the req object
	req.requestTime = new Date().toISOString();

	// move onto the next middleware in the middleware stack of the 'req res cycle'
	next();
});

// applying middleware to only specific routes; mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;