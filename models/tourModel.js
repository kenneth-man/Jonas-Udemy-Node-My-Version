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
			// validate: [validator.isAlpha, 'Name must consist of only letters']
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
			max: [5, 'Rating must be below 5'],
			// setter function; ran every time a new value is assigned for this property
			set: (value) => value.toFixed(2)
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
			// could also format in array as shown in the above custom validator
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
		},
		startLocation: {
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: {
				type: String
			},
			description: {
				type: String
			}
		},
		// embedded document type (documents inside parent document)
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: {
					type: String
				},
				description: {
					type: String
				},
				day: {
					type: Number
				}
			}
		],
		// child referencing documents by 'ObjectId'
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User'
			}
		]
	},
	// schema options
	// want virtual properties to show in output
	{
		toJSON: {
			virtuals: true
		},
		toObject: {
			virtuals: true
		},
	}
);

// single field index; typically index if field/property will be accessed frequently to improve performance on a GET request
// sorting 'price' property in ascending order; 1 === ascending; -1 === descending
tourSchema.index({
	price: 1
});

tourSchema.index({
	slug: 1
});

// compound index; more than one field/property to index
tourSchema.index({
	duration: 1,
	difficulty: 1
})

// virtual property; used to perform operation on a schema property, then assign a new property
// cannot be used in queries
tourSchema.virtual('durationWeeks').get(function() {
	// using a function declaration so we have access to 'this' keyword which refers to the current document
	return this.duration / 7;
});

// virtual populate; basically child referencing in the model and populating but the data (e.g. array of child id's) is not in the document returned
// use when you need to child reference, but want to prevent a potentially inifinitly scaling array of child elements
tourSchema.virtual(
	'reviews',
	{
		ref: 'Review',
		foreignField: 'tour',
		localField: '_id'
	}
)

// 4 types of mongoose middleware: DOCUMENT, QUERY, AGGREGATE, MODEL
// --- DOCUMENT middleware --- runs before (pre) or after (post) the currently processed document is saved or created
// 'save' hook only runs for the '.save()' or '.create()' mongoose methods
// every middleware function has access to 'next'
tourSchema.pre('save', function(next) {
	// 'this' refers to the current document
	this.slug = slugify(
		this.name,
		{
			lower: true
		}
	);

	next();
});

// // EXAMPLE: Embedded guide documents in tour documents
// // replacing all 'guides' id's with their data as embedded documents in a parent Tour document
// tourSchema.pre('save', async function(next) {
// 	// the 'map' returns an array of promises; Promise.all() creates a promise that resolves
// 	// when all proivded promises have resolved/rejected
// 	const guidesPromises = this.guides.map(async (curr) => await User.findById(curr));
// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// });

// executed once all pre() middleware functions have completed
tourSchema.post('save', function(document, next) {
	next();
});

// --- QUERY middleware --- runs before (pre) or after (post) a query is executed
// any hook that begins with 'find' will run this middleware function (e.g. find, findOne, findOneAndDelete...)
tourSchema.pre(/^find/, function(next) {
	// find all documents where 'secretTour' is not equal to true
	// 'this' refers to the current query
	this.find({
		secretTour: {
			$ne: true
		}
	});

	this.start = Date.now();

	next();
});

tourSchema.pre(/^find/, function(next) {
	// 'populate' means populating the document properties with references ('ref' property/ies)
	this.populate({
		path: 'guides',
		// exclude these properties in the document returned from this query
		select: '-__v -passwordChangedAt'
	});
		
	next();
});

tourSchema.post(/^find/, function(documents, next) {
	console.log(`Query took ${Date.now() - this.start}ms`);
	next();
});

// --- AGGREGATION middleware --- runs before (pre) or after (post) an aggregation is executed
tourSchema.pre('aggregate', function(next) {
	// 'this' refers to the current aggregation object
	this
		.pipeline()
		.unshift({
			$match: {
				secretTour: {
					$ne: true
				}
			}
		});

	next();
});

tourSchema.post('aggregate', function(next) {
	next();
});

// creating a model from a schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
