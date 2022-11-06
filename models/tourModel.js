const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
	// schema definitons
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxLength: [40, 'A tour name must be equal to or less than 40 characters'],
			minLength: [10, 'A tour name must be equal to or greater than 10 characters'],
			// custom validator
			validate: [validator.isAlpha, 'Name must consist of only letters']
		},
		slug: {
			type: String
		},
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty can only be of type "easy", "medium", or "difficult"'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1'],
			max: [5, 'Rating must be below 5']
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: {
			type: Number,
			// could aslo format in array as shown in the above custom validator
			validate: {
				validator: function(value) {
					// 'value' is the priceDiscount value; 
					// 'this' refers to current document (only on document creation, not when updating)
					return value < this.price
				},
				message: 'Price discount ({VALUE}) should be less than the regular price'
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a summary']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: {
			// of type 'string[]'
			type: [String]
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false
		},
		startDates: {
			type: [Date]
		},
		secretTour: {
			type: Boolean,
			default: false
		}
	},
	//schema options
	{
		toJSON: {
			virtuals: true
		},
		toObject: {
			virtuals: true
		},
	});

// virtual property; used to perform operation on a schema property, then assign a new property
// cannot be used in queries
tourSchema.virtual('durationWeeks').get(function() {
	// using a function declaration so we have access to 'this' keyword which refers to the current document
	return this.duration / 7;
});

// 4 types of mongoose middleware: DOCUMENT, QUERY, AGGREGATE, MODEL
//////////////////////////////////////////////////////////////////////
// --- DOCUMENT middleware; runs before or after the currently processed document is saved
// 'save' hook only runs for the '.save()' or '.create()' mongoose methods
// every middleware function has access to 'next'
tourSchema.pre('save', function(next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre('save', function(next) {
	console.log('pre save hook to do something');
	next();
});

// executed once all pre() middleware functions have completed
// acts on the saved document
tourSchema.post('save', function(document, next) {
	console.log(document);
	next();
});

// --- QUERY middleware; runs before or after a query is executed
// any hook that begins with 'find' will run this middleware function (e.g. find, findOne, findOneAndDelete...)
tourSchema.pre(/^find/, function(next) {
	// find all documents where 'secretTour' is not equal to true
	// 'this' refers to the current query
	this.find({ secretTour: { $ne: true } });
	this.start = Date.now();
	next();
});

tourSchema.post(/^find/, function(documents, next) {
	console.log(`Query took ${Date.now() - this.start}ms`);
	console.log(documents)
	next();
});

// --- AGGREGATION MIDDLEWARE; runs before or after an aggregation is executed
tourSchema.pre('aggregate', function(next) {
	// 'this' refers to the current aggregation object
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
	next();
});

tourSchema.post('aggregate', function(next) {
	next();
});

// creating a model from a schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
