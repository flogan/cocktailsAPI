const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const DATABASE_NAME = process.env.DATABASE_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;
const CONNECTION_URL = process.env.BASE_URL + process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + process.env.CLUSTER_URL + DATABASE_NAME + '?retryWrites=true&w=majority';

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.set("port", process.env.PORT || 3001);
var database, collection;

app.listen(app.get("port"), () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, { useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection(COLLECTION_NAME);
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.get("/", (request, response) => {
    response.send("Connected to cocktailsAPI");
});

app.get("/allcocktails", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

//Search by drink name
app.get("/cocktails/drink/", (request, response) => {
    collection.find({"drink": request.query.drink }).collation( { locale: 'en', strength: 2 } ).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/cocktails/drink-search/", (request, response) => {
    collection.find({"drink": { $regex: ".*" + request.query.drink + ".*", $options: "i" } }).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

//Search by ingredient
app.get("/cocktails/ingredient/", (request, response) => {
    collection.find({"ingredients": { $all: [request.query.ingredient] } }).collation( { locale: 'en', strength: 2 } ).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
