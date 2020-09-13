const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const getColors = require('get-image-colors');
require("dotenv").config();

const { PORT, DATABASE_NAME, COLLECTION_NAME, BASE_URL, MONGO_USER, MONGO_PASSWORD, CLUSTER_URL } = process.env;
const CONNECTION_URL = `${BASE_URL}${MONGO_USER}:${MONGO_PASSWORD}${CLUSTER_URL}${DATABASE_NAME}?retryWrites=true&w=majority`;
const port = PORT || 3001;

const { API_KEY, API_CODE } = process.env;

const colors = url => {
    return new Promise((resolve, reject) => {
        getColors(url).then(color => {
            return resolve(color[0]._rgb);
        }).catch(error => reject(error));
    });
};

const verify = (req, res, next) => {
    let { api_key, api_code } = req.headers;
    if(api_key == API_KEY && api_code == API_CODE) return next();
    return res.send('not authorized');
}

const queryDb = query => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(CONNECTION_URL,
        {useNewUrlParser: true, useUnifiedTopology: true})
        .then(client => {
          const db = client.db(DATABASE_NAME);
          const cursor = db.collection(COLLECTION_NAME).find(query).collation( { locale: 'en', strength: 2 } ).toArray()
            .then(response => {
              client.close();
              return resolve(response);
            })
        })
        .catch(error => reject(error));
    });
};

const app = Express()
.use(BodyParser.json())
.use(BodyParser.urlencoded({ extended: true }))
.set('json spaces', 2);
// routes
app.get("/", (request, response) => response.send("Connected to cocktailsAPI"))
// get all
.get("/allcocktails", verify, (request, response) => {
    queryDb({})
        .then(resp => response.json(resp))
        .catch(err => response.status(500).send(err));
})
//Search by drink name
.get("/cocktails/drink/", (request, response) => {
  let normalize = [];
  queryDb({"drink": request.query.drink}).then(resp => {
    resp.forEach(elem => {
        colors(elem.drink_thumb).then(color => {
            let _drink = new  Drink(elem, color);
            normalize.push(_drink);
        });
    });
    return response.json(normalize);
  })
  .catch(err => response.status(500).send(err));
})
.get("/cocktails/drink-search/", (request, response) => {
    let reg = new RegExp(`.*${request.query.drink}.*`, 'i');
    let normalize = [];
    queryDb({"drink": reg}).then(resp => {
        resp.forEach(elem => {
            colors(elem.drink_thumb).then(color => {
                let _drink = new  Drink(elem, color);
                normalize.push(_drink);
            });
        });
    return response.json(normalize);
    })
    .catch(err => response.status(500).send(err));
})
// get by ingredient
.get("/cocktails/ingredient/", (request, response) => {
    let normalize = [];
    queryDb({"ingredients": request.query.ingredient}).then(resp => {
        resp.forEach(elem => {
            colors(elem.drink_thumb).then(color => {
                let _drink = new  Drink(elem, color);
                normalize.push(_drink);
            });
        });
    return response.json(normalize);
    })
    .catch(err => response.status(500).send(err));
})
.get('*', (req, res) => res.redirect('/'))
.listen(port, () => console.log(`server started at http://localhost:${ port }`));

class Drink {
  constructor(data, color) {
      this.drink = data.drink;
      this.drink_id = data.drink_id;
      this.alcoholic = data.alcoholic;
      this.category = data.category;
      this.drink_thumb = data.drink_thumb;
      this.glass = data.glass;
      this.iba = data.iba;
      this.ingredients = data.ingredients;
      this.instructions = data.instructions;
      this.measurement = data.measurement;
      this.video = data.video;
      this.color = color;
  }
  data(){
      return {
          "drink": this.drink,
          "drink_id": this.drink_id,
          "alcoholic": this.alcoholic,
          "category": this.category,
          "drink_thumb": this.drink_thumb,
          "glass": this.glass,
          "iba": this.iba,
          "ingredients": this.ingredients,
          "instructions": this.instructions,
          "measurement": this.measurement,
          "video": this.video,
          "color": this.color
      }
  }
}
