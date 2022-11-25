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
router.patch('/updateMyPassword', protect, updatePassword);
router.get('/me', protect, getMe, getUser);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router
	.route('/')
	.get(getAllUsers)

router
	.route('/:id')
	.get(getUser)
	.patch(protect, restrictTo('admin'), updateUser)
	.delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
