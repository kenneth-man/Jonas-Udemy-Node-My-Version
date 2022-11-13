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
			select: false
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
		},
		passwordChangedAt: {
			type: Date
		}
	}
);

// encryption of user passwords; this middleware runs between getting data and saving to database
userSchema.pre('save', async function(next) {
	// if password wasn't modified, call next middleware
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);

	// remove the 'passwordConfirm' property; not included in the new document
	this.passwordConfirm = undefined;

	next();
});

// instance method; available on all 'User' documents
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = async function(JWTTimestamp) {
	if (this.passwordChangedAt) {
		// converted 'passwordChangedAt' to timestamp format for comparison with 'JWTTimestamp'
		const passwordChangedAtTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);

		return JWTTimestamp < passwordChangedAtTimestamp;
	}

	// password was not changed
	return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
