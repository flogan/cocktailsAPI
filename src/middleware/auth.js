const { API_KEY, API_CODE } = process.env;

const verify = (req, res, next) => {
	let { api_key, api_code } = req.headers;
	if (api_key || !api_code) {
		return res.status(401).send("not authorized");
	}
	if (api_key == API_KEY && api_code == API_CODE) return next();
	else {
		return res.send("not authorized");
	}
};

module.exports = verify;