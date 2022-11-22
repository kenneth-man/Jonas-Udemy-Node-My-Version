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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;