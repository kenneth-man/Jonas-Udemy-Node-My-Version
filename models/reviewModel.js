const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

// preventing duplicate reviews (each combination of 'tour' and 'user' must be unique)
reviewSchema.index(
	{
		tour: 1,
		user: 1
	},
	{
		unique: true
	}
);

// static method; in static methods the 'this' keyword refers to the current model;
// in instance methods the 'this' keyword refers to the current document
reviewSchema.statics.calcAverageRatings = async function(tourId) {
	const stats = await this.aggregate([
		{
			$match: {
				tour: tourId
			}
		},
		{
			$group: {
				_id: '$tour',
				numOfRatings: {
					$sum: 1
				},
				avgRating: {
					$avg: '$rating'
				}
			}
		}
	]);

	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(
			tourId,
			{
				ratingsQuantity: stats[0].numOfRatings,
				ratingsAverage: stats[0].avgRating
			}
		);

		return;
	}

	await Tour.findByIdAndUpdate(
		tourId,
		{
			ratingsQuantity: 0,
			ratingsAverage: 4.5
		}
	);
};

reviewSchema.post('save', function(document, next) {
	// 'this' refers to the current review to be saved
	// 'this.constructor' refers to the current model 
	this.constructor.calcAverageRatings(this.tour);

	next();
});

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

// for 'findOneAndUpdate' and 'findOneAndDelete' methods that are executed for 'findByIdAndUpdate' and findByIdAndDelete' respectively
reviewSchema.post(/^findOneAnd/, async function(document, next) {
	await document.constructor.calcAverageRatings(document.tour);

	next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;