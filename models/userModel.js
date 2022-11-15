const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
		role: {
			type: String,
			enum: ['user', 'guide', 'lead-guide', 'admin'],
			default: 'user'
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
		},
		passwordResetToken: {
			type: String
		},
		passwordResetExpires: {
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

userSchema.methods.changedPassword = function(JWTTimestamp) {
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
};

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex');

	// assigning encrypted reset token to user document
	// using 'crypto' module as it's faster than bcrypt and don't require a optimally secure token (as it's only valid for a short amount of time 10 mins)
	// modified user document (same for the below) but not updated in database, so need to '.save()' (in authController)
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// password expires in 10 minutes
	this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

	// send token to user
	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
