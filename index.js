const app = require("./src/app").app;
const connect = require("./src/app").connect;
const verify = require("./src/middleware/auth");
const drinks = require("./src/entities/Drinks");
const port = process.env.PORT || 3001;

connect();
app.get("/", (request, response) => response.send("Connected to cocktailsAPI"));
app.get("/allcocktails", verify, async (request, response) => {
	try {
		const query = await drinks.find();
		return response.status(200).json(query);
	} catch (error) {
		return response.status(error.message);
	}
});
app.get("/cocktails/drink/", async (request, response) => {
	try {
		const query = await drinks.find({
			"drink": request.query.drink
		});
		return response.status(200).json(query);
	} catch (error) {
		return response.status(500).send(error.message);
	}
});
app.get("/cocktails/drink-search/", async (request, response) => {
	const reg = new RegExp(`.*${request.query.drink}.*`, "i");
	try {
		const query = await drinks.find({
			"drink": reg
		});
		return response.status(200).json(query);
	} catch (error) {
		return response.status(500).send(error.message);
	}
});
app.get("/cocktails/ingredient/", async (request, response) => {
	const reg = new RegExp(`.*${request.query.ingredient}.*`, "i");
	try {
		const query = await drinks.find({
			"ingredients": reg
		});
		return response.status(200).json(query);
	} catch (error) {
		return response.status(500).send(error.message);
	}
});
app.get("*", (request, response) => {
	response.status(404).send("not found");
});
app.listen(port, () => console.log(`server started at http://localhost:${port}`));