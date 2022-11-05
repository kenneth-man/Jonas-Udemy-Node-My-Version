// refactored the 'try catch' blocks in each controller function
module.exports = asyncFunction => {
	// when returning a middleware function, Express automatically passes the 3 arguments req, res, next
	return (req, res, next) => asyncFunction(req, res, next).catch(next);
	// could also write as 'catch(error => next(error))'
	// 'error' argument is automatically passed into 'next' function
};

// if we hadn't put 'asyncFunction' in the returned anonymous function, then it would've been' executed immediately; returning a function is not calling it
// we don't want to execute the the function immediately because we want express to execute it when a request is made
