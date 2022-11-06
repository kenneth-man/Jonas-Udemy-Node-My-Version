const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A user must have a name'],
			validate: [validator.isAlpha, 'Name must consist of only letters']
		},
		email: {
			type: String,
			required: [true, 'Please provide an email'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Email must be of a valid format']
		},
		photo: {
			type: String
		},
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minLength: [8, 'A password must be equal to or greater than 8 characters'],
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Please confirm your password'],
			// this only works when creating or saving a document (.create() or .save())
			validate: [
				function(value) {
					return value === this.password;
				},
				'Passwords must match'
			]
		}
	}
);

// encryption of user passwords; this middleware runs between getting data and saving to database
userSchema.pre('save', async function(next) {
	// if password wasn't modified, call next middleware
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);

	// remove this property; not included in the new document
	this.passwordConfirm = undefined;

	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
