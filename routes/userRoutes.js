const express = require('express');
const {
	getAllUsers,
	getMe,
	updateMe,
	deleteMe,
	getUser,
	updateUser,
	deleteUser
} = require('../controllers/userController');
const {
	protect,
	restrictTo,
	signup,
	login,
	forgotPassword,
	resetPassword,
	updatePassword
} = require('../controllers/authController');

const router = express.Router();

// specific route that only has one http method (post for signing up a user)
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// all subsequent routes in this router are only reachable if the 'protect' middleware passes without error;
// all middleware runs in sequence
router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.get('/', getAllUsers)

router
	.route('/:id')
	.get(getUser)
	.patch(updateUser)
	.delete(deleteUser);

module.exports = router;
