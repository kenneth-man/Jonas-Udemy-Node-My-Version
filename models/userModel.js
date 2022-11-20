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
			// validation only runs when creating '.create()' or saving '.save()' a document
			// doesn't run when 'updating' e.g. findByIdAndUpdate()
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

userSchema.pre('save', function(next) {
	if (!this.isModified('password') || this.isNew) return next();

	// - 1 second to make sure this prop is less than the token created (created after passworChangedAt)
	this.passwordChangedAt = Date.now() - 1000;
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
	// random string of 32 characters
	const resetToken = crypto.randomBytes(32).toString('hex');

	// encrypt the reset token and assign to the current user document
	// using 'crypto' module to generate jwt as it's faster than bcrypt; also we don't require an optimally secure token (as it's only valid for a short amount of time 10 mins)
	// modified user document properties (same for the below) but not updated in database, so need to '.save()' the document (in authController)
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// password expires in 10 minutes
	this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

	// we return the plaintext token which will be used to send to user's email
	// and we have stored the encrypted resetToken in the user's document
	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
