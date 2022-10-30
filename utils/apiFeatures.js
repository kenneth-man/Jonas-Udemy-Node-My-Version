class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		const queryObj = { ...this.queryString };

		// we want to exclude specific fields names from being queries parameter
		// because they will be used differently than regular query parameters
		const excludedFields = ['page', 'sort', 'limit', 'fields'];

		// 'delete' operator; for each value in 'excludedFields', delete key value pair from 'queryObj' if it exists
		excludedFields.forEach(curr => delete queryObj[curr]);

		let queryStr = JSON.stringify(queryObj);

		// regex to replace operators to operators with dollar sign; e.g. 'gte' becomes '$gte'
		// mongoose requires '$' dollar sign for operators
		// e.g. example url... 127.0.0.1:3000/api/v1/tours?duration[gte]=5&price[lt]=1500
		// with an example filter object... { duration: { $gte: 5 }, price: { $lt: 1500 } };
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, matchingStr => `$${matchingStr}`);

		// using a mongoose 'query method', which all return a Query Object https://mongoosejs.com/docs/queries.html
		// 'Query.prototype' in documentation refers to any Object/Instance created from the Query class
		// we don't await here, so that we can define pagination, sorting... before returning data;
		// awaiting causes the data promise to be returned
		this.query = this.query.find(JSON.parse(queryStr));

		// enable chaining
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			// if multiple arguments in query url are input (sorted in order ltr)
			// mongoose requires spaces instead of commas; using commas as we can't put spaces in a url string
			// e.g. example url... 127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage
			// but mongoose sort requires spaces... this.query.sort(price ratingsAverage);
			const sortBy = this.queryString.sort.split(',').join(' ');

			this.query = this.query.sort(sortBy);
		} else {
			// if no sort query parameter input, sort by descending '-' the 'createdAt' values
			this.query = this.query.sort('-createdAt');
		}

		return this;
	}

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			// '-' excluding the '__v' field (key) when sending data back to client
			this.query = this.query.select('-__v')
		}

		return this;
	}

	paginate() {
		const page = Number(this.queryString.page) || 1;
		const limit = Number(this.queryString.limit) || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;