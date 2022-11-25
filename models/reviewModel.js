const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Cannot have an empty review']
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: [true, 'A review must have a rating']
		},
		createdAt: {
			type: Date,
			default: Date.now
		},
		// parent referencing
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A Review must belong to a tour']
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'A review must be created from a user']
		}
	},
	{
		toJSON: {
			virtuals: true
		},
		toObject: {
			virtuals: true
		},
	}
);

reviewSchema.pre(/^find/, function(next) {
	// e.g. when you need to populate more than one document property
	// this
	// 	.populate({
	// 		path: 'tour',
	// 		select: 'name'
	// 	})
	// 	.populate({
	// 		path: 'user',
	// 		select: 'name photo'
	// 	});

	this.populate({
		path: 'user',
		select: 'name photo'
	});
		
	next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;