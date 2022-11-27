const express = require('express');
const {
	aliasTopTours,
	getTourStats,
	getAllTours, 
	createTour, 
	getTour, 
	updateTour,
	deleteTour,
	getMonthlyPlan,
	getToursWithin
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
router.get('/top-5-cheap', aliasTopTours, getAllTours);

router.get('/tour-stats', getTourStats);

router.get('/monthly-plan/:year', protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// every query parameter the user sends in the URL after '?' will be available in 'req.query'
// https://stackoverflow.com/questions/63205191/express-route-parameters-vs-http-query-parameters
router.get('/tours-within', getToursWithin);

router.get('/distances-between', getDistances);

router
	.route('/')
	.get(getAllTours)
	.post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
	.route('/:id')
	.get(getTour)
	.patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
	.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
