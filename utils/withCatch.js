module.exports = function (promise) {
	let result = { err: null, data: null }
	return promise
		.then((res) => {
			result.data = res;
			return result;
		})
		.catch((err) => {
			result.err = err;
			return result;
		});
}