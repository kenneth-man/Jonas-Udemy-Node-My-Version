const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Loads .env file contents into process.env; available to every file in the solution
// 'config()' must be called before modules need to use the env variables (e.g. app.js)
dotenv.config({ path: './config.env' });

// Connect database with our express app via mongoose
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(connection => {
		// console.log(connection);
	});

const app = require('./app');

app.listen(process.env.PORT, () => {
	console.log(`App running on port ${process.env.PORT}`);
});
