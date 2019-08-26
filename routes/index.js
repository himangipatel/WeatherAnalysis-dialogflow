var express = require('express');
var router = express.Router();
const { dialogflow, SignIn, Image } = require('actions-on-google');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";  
var user_statistics = require('../models/user_statistics')


const app = dialogflow({
  clientId: '5ig3Hwgxi0d1D6XfOl7gOeCTIq3ncwx8',
  debug: true
});


/* GET home page. */
router.get('/', function(req, res, next) {
 
  res.render('index', { title: 'Express' });

 
  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("MongoDatabase");
    
  //   let cityName = "Maharashtra";
  //   dbo.collection("cities").find({ state:cityName}).toArray(function(err, result) {
  //     if (err) throw err;
  //     console.log(result);
  //     var i;
  //     var cities="";
  //     for (i = 0; i < result.length; i++) {
  //       cities += result[i].name +", ";
  //     }
  //     console.log(cities);
  //     db.close();
  //   });
  // });

});


function createCollection(){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MongoDatabase");
    var myobj = { name: "Company Inc", address: "Highway 37" };

    dbo.createCollection("customers", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });

    // dbo.collection("customers").insertOne(myobj, function(err, res) {
    //   if (err) throw err;
    //   console.log("1 document inserted");
    //   db.close();
    // });
  });
}

function insertInCollection(){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MongoDatabase");
    var myobj = { name: "Company Inc", address: "Highway 37" };

    dbo.collection("customers").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

module.exports = router;
