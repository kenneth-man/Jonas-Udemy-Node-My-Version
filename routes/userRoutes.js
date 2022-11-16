const express = require('express');
const {
	getAllUsers,
	createUser,
	getUser,
	updateUser,
	deleteUser
} = require('../controllers/userController');
const {
	signup,
	login,
	forgotPassword,
	resetPassword
} = require('../controllers/authController');

const router = express.Router();

// specific route that only has one http method (post for signing up a user)
router.post('/signup', signup);

router.post('/login', login);

router.post('/forgotPassword', forgotPassword);

router.patch('/resetPassword/:token', resetPassword);

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
