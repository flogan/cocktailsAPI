const mongoose = require("mongoose");
const { COLLECTION_NAME } = process.env;

const Drinks = new mongoose.Schema({
	drink: {
		type: String
	},
	drink_id: {
		type: String
	},
	alcoholic: {
		type: String
	},
	category: {
		type: String
	},
	drink_thumb: {
		type: String
	},
	glass: {
		type: String
	},
	iba: {
		type: String
	},
	ingredients: [{
		type: String
	}],
	instructions: {
		type: String
	},
	measurement: [{
		type: String
	}],
	video: {
		type: String
	}
});

module.exports = mongoose.model(COLLECTION_NAME, Drinks);