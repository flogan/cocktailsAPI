require("dotenv").config();
const mongoose = require("mongoose");
const Express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const responseTime = require("response-time");
const compression = require("compression");
const BodyParser = require("body-parser");

// eslint-disable-next-line no-unused-vars
const { DATABASE_NAME, COLLECTION_NAME, BASE_URL, MONGO_USER, MONGO_PASSWORD, CLUSTER_URL } = process.env;
const CONNECTION_URL = `${BASE_URL}${MONGO_USER}:${MONGO_PASSWORD}${CLUSTER_URL}${DATABASE_NAME}?retryWrites=true&w=majority`;

const connect = async () => {
	try {
		await mongoose.connect(CONNECTION_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = mongoose.connection;
		db.once("open", () => console.log("db connecetd"));
	} catch (error) {
		throw new Error(error);
	}
};

const app = Express();
// init
app.set("json spaces", 2);
app.disabled("x-powered-by");
app.use(cors());
app.use(helmet());
app.use(responseTime());
app.use(compression());
app.use(morgan("combined"));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

module.exports = {
	app: app,
	connect: connect
};
