const mongoose = require('mongoose');
const dotenv = require('dotenv');

// handling uncaught exceptions (synchronous code errors)
process.on('uncaughtException', err => {
	console.log(`${err}. Exiting application`);
	process.exit(1);
});

// Loads .env file contents into process.env; available to every file in the solution
// 'config()' must be called before modules need to use the env variables (e.g. app.js)
dotenv.config({ path: './config.env' });

// Connect mongoDB database with our express app via mongoose
mongoose
	.connect(
		process.env.DATABASE,
		{
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		}
	)
	// .then(connection => {
	// 	console.log(connection);
	// });

const app = require('./app');
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

// handling errors outside express: unhandled rejections (asynchronous code errors not from our application)
process.on('unhandledRejection', err => {
	console.log(`${err}. Exiting application`);

	// runs callback after server is closed
	server.close(() => {	
		process.exit(1);
	});
});
