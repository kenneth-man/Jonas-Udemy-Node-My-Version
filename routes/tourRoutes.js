const express = require('express');
const {
	aliasTopTours,
	getTourStats,
	getAllTours, 
	createTour, 
	getTour, 
	updateTour,
	deleteTour
} = require('../controllers/tourController');

const router = express.Router();

// appling middleware 'aliasTopTours' before 'getAllTours'
router
	.route('/top-5-cheap')
	.get(aliasTopTours, getAllTours);

router
	.route('/tour-stats')
	.get(getTourStats);

router
	.route('/')
	.post(createTour)
	.get(getAllTours);

router
	.route('/:id')
	.get(getTour)
	.patch(updateTour)
	.delete(deleteTour);

module.exports = router;
