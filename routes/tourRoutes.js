const express = require('express');
const {
	aliasTopTours,
	getTourStats,
	getAllTours, 
	createTour, 
	getTour, 
	updateTour,
	deleteTour,
	getMonthlyPlan
} = require('../controllers/tourController');
const {
	protect,
	restrictTo
} = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// mounting router to a NESTED ROUTE;
// redirects to the 'reviewRouter' if the route url matches '/:tourId/reviews'
router.use('/:tourId/reviews', reviewRouter);

// applying middleware 'aliasTopTours' before 'getAllTours'
router
	.route('/top-5-cheap')
	.get(aliasTopTours, getAllTours);

router
	.route('/tour-stats')
	.get(getTourStats);

router
	.route('/monthly-plan/:year')
	.get(getMonthlyPlan);

router
	.route('/')
	.post(createTour)
	.get(protect, getAllTours);

router
	.route('/:id')
	.get(getTour)
	.patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
	.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
