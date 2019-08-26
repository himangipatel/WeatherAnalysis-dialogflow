var express = require('express');
var router = express.Router();
var ManagementClient = require('auth0').ManagementClient;
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/Quiz";
var user_statistics = require('../models/user_statistics')


var management = new ManagementClient({
    domain: 'dev-v88rgjw5.auth0.com',
    clientId: '5ig3Hwgxi0d1D6XfOl7gOeCTIq3ncwx8',
    clientSecret: 'G0glkshDsVn6FuoQkRxFc_NDwb0eJJRpjGjB2nQn1vUQ0SXJ82TBNorgYG-YY8JH'
});


/* GET home page. */
router.post('/', function (req, res, next) {
    handleQuizReq(req, res, next)
});


async function handleQuizReq(req, res, next) {

    var body = await req.body.queryResult;

    var intentType = body.intent.displayName;

    console.log(intentType);
    const accessToken = req.body.originalDetectIntentRequest.payload.user.accessToken;


    switch (intentType) {
        case 'Default Welcome Intent':
            getUserProfile(accessToken, function (resmessage) {
                let message = 'I got your account details. your EmailID is ' +
                    resmessage.email + ' What do you want to do next?'
                res.send(createTextResponse(message))

            });
            // const result = await callUserProfile(accessToken)

            break;
        case 'Addition':
            let number1 = body.parameters["number1"];
            let number2 = body.parameters["number2"];
            let message = `Additon of ${number1} and ${number2} is ` + (parseInt(number1) + parseInt(number2))
            getUserProfile(accessToken, function (resmessage) {
                insertUserStatistics(resmessage.sub, intentType, body.queryText)
                res.send(createTextResponse(message))
            });

            break;

        case 'subtraction':
            let snumber1 = body.parameters["number1"];
            let snumber2 = body.parameters["number2"];
            let msg = `Subtraction of ${snumber2} from ${snumber1} is ` + (parseInt(snumber1) - parseInt(snumber2))
            getUserProfile(accessToken, function (resmessage) {
                insertUserStatistics(resmessage.sub, intentType, body.queryText)
                res.send(createTextResponse(msg))
            });
            break

        case 'getUserQuestionsHistory':
            getUserProfile(accessToken, function (resmessage) {
                getUserQuestionsHistory(resmessage.sub, resmessage.nickname, function (resmessage) {
                    res.send(createTextResponse(resmessage))
                });
            });
            break
        default:
            res.send(createTextResponse('Default Action Response'));
            break

    }


}

function getUserQuestionsHistory(user_id, userName, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        var dbo = db.db("Quiz");
        var additionCount = 0;
        var subtractionCount = 0;

        dbo.collection("user_statistics").find({ user_id: user_id, question_type: 'subtraction' }).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            subtractionCount = result.length

            dbo.collection("user_statistics").find({ user_id: user_id, question_type: 'Addition' }).toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                additionCount = result.length
                db.close();

                let message = `${userName} has asked ${additionCount} questions about Additions and ${subtractionCount} questions about Subtraction`;
                callback(message)
            });

        });


    });
}

function insertUserStatistics(user_id, question_type, question) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        var dbo = db.db("Quiz");
        var user_statisticsobj = {};

        user_statisticsobj.user_id = user_id;
        user_statisticsobj.question_type = question_type;
        user_statisticsobj.question = question;

        dbo.collection("user_statistics").insertOne(user_statisticsobj, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
}

function getUserProfile(accessToken, callback) {

    axios.get('http://dev-v88rgjw5.auth0.com/userinfo', {
        headers: {
            authorization: 'Bearer ' + accessToken
        }
    }).then((response) => {

        console.log(response.data)

        callback(response.data)
    }).catch((error) => {
        console.log(error)
    })
}


async function callUserProfile(accessToken) {

    axios.get('http://dev-v88rgjw5.auth0.com/userinfo', {
        headers: {
            authorization: 'Bearer ' + accessToken
        }
    }).then((response) => {

        console.log(response.data)

        let message = 'I got your account details. your EmailID is ' +
            response.data.email + ' What do you want to do next?'
        return message
    }).catch((error) => {
        console.log(error)
    })
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


  // management
  //   .getUsers()
  //   .then(function (users) {
  //     var i;
  //     var msg = "";
  //     for (i = 0; i < users.length; i++) {
  //       msg += users[i].email + "\n";
  //     }

  //     res.send(createTextResponse(message + ' ----- ' + msg))
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   });
