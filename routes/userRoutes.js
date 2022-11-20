const express = require('express');
const {
	getAllUsers,
	updateMe,
	deleteMe,
	createUser,
	getUser,
	updateUser,
	deleteUser
} = require('../controllers/userController');
const {
	protect,
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
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router
	.route('/')
	.get(getAllUsers)
	.post(createUser);

router
	.route('/:id')
	.get(getUser)
	.patch(updateUser)
	.delete(deleteUser);

module.exports = router;
