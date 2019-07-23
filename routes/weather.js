var express = require('express');
var axios = require('axios');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/MongoDatabase";
const { dialogflow, SignIn, Image } = require('actions-on-google');
const functions = require('firebase-functions');

const app = dialogflow({ debug: true, clientId: '5da2282196bb4243ba3bfa7f70af0369' });

router.post('/', function (req, res, next) {
  // handleWeatherReq(req, res, next)


  console.log("Action called...........!!!")
  app.intent('Default Welcome Intent', (conv) => {
    conv.ask('Hi, how is it going?');
    conv.ask(`Here's a picture of a cat`);
    conv.ask(new Image({
      url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
      alt: 'A cat',
    }));
    conv.ask(new SignIn('To get your account details'));

  });

});


async function handleWeatherReq(req, res, next) {
  var body = await req.body.queryResult;

  var intentType = body.intent.displayName;

  switch (intentType) {
    case 'welcome':
      res.send(createTextResponse('Welcome to weather analysis from webHook'));
      break;
    case 'getWeather':
      console.log(body);
      let city = body.parameters["geo-city"];
      let country = body.parameters["geo-country-code"];
      let countryName = country['alpha-2'];
      let url = `http://api.openweathermap.org/data/2.5/weather?q=${city},${countryName}&APPID=0ed0839d26e395af50e382032d65017c`;
      console.log(city);
      console.log(url);
      axios.get(url).then(aRes => {
        let conditions = aRes.data.weather[0].main;
        let temp = aRes.data.main.temp;

        let textResponse = `In ${city}, it is ${temp} degrees Kelvin and ${conditions}`;
        res.send(createTextResponse(textResponse));

      }).catch(err => {
        console.log(err);
      })
      break;
    case 'cityList':
      let cityName = body.parameters["geo-state"];
      console.log(cityName);
      // var cities = 'Mumbai\nDelhi\nBangalore\nHyderabad\nAhmedabad\nChennai\nKolkata\nSurat\nPune\nJaipur\nCredencys Solutions'
      // res.send(createTextResponse(cities));
      fetchCitiesFromDb(res, cityName)
      break
    case 'developerName':
      res.send(createTextResponse('Himangi Patel'));
      break

  }


}

function fetchCitiesFromDb(res, cityName) {

  if (cityName) {
    try {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MongoDatabase");

        console.log("City name : ----------" + cityName)
        // let cityName = "Gujarat";
        dbo.collection("cities").find({ state: cityName }).toArray(function (err, result) {
          if (err) throw err;
          console.log(result);
          var i;
          var cities = "";
          for (i = 0; i < result.length; i++) {
            cities += result[i].name + ", ";
          }
          console.log(cities);
          res.send(createTextResponse(cities));

          db.close();
        });
      });
    } catch{
      var cities = 'Mumbai\nDelhi\nBangalore\nHyderabad\nAhmedabad\nChennai\nKolkata\nSurat\nPune\nJaipur\nCredencys Solutions'
      res.send(createTextResponse(cities));
    }
  } else {
    var cities = 'State not found'
    res.send(createTextResponse(cities));
  }

}

function createTextResponse(textResponse) {
  let response = {
    "fulfillmentText": textResponse,
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            textResponse
          ]
        }
      }
    ],
    "source": "example.com",
    "payload": {
      "google": {
        "expectUserResponse": true,
        "richResponse": {
          "items": [
            {
              "simpleResponse": {
                "textToSpeech": textResponse
              }
            }
          ]
        }
      },
      "facebook": {
        "text": "Hello, Facebook!"
      },
      "slack": {
        "text": "This is a text response for Slack."
      }
    }
  }
  return response;
}

module.exports = router;
