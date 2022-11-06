const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

// Connect database with our express app via mongoose
mongoose
	.connect(
		process.env.DATABASE_PASSWORD,
		{
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false
		}
	)
	.then(connection => {
		// console.log(connection.connections);
	});

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data into database
const importData = async () => {
	try {
		await Tour.create(tours);
		console.log('Data successfully loaded');
	} catch(err) {
		console.log(err);
	}
	process.exit();
}

// Delete all data from database 
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log('Data successfully deleted');
	} catch(err) {
		console.log(err);
	}
	process.exit();
}

// e.g. if run in commandline: node dev-data/data/import-dev-data.js --import
process.argv[2] === '--import' && importData();

// e.g. if run in commandline: node dev-data/data/import-dev-data.js --delete
process.argv[2] === '--delete' && deleteData();
