'use strict';
// call the packages we need
const express = require('express')
var requestService = require('request');
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();

//database config
const MongoClient = require('mongodb').MongoClient;
var db;
const database = 'unconference-buddy';
const collectionname = 'eventdetails';
const datafilename = 'data.json';
const mongodburl = 'mongodb://localhost:27017';

MongoClient.connect(mongodburl, (err, client) => {
	if (err) return console.log(err);
	db = client.db(database); // whatever your database name is
	db.collection(collectionname, {}, function (err, coll) {
		if (err != null) {
			db.createCollection(collectionname, function (err, result) {
			});
		}
		db.ensureIndex(collectionname, {
			document: "text"
		}, function (err, indexname) {
		});
	});
});

//app's config
// app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
const server = app.listen(process.env.PORT || 5000, () => {
	console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//Simple get call
app.get('/', function (request, response) {
	res.send('Hello, This is UnConferenceBuddy DialogFlow WebHook')
});

app.get('/admin/load/data', (req, res) => {
	fs.readFile(datafilename, 'utf8', function (err, data) {
		db.collection(collectionname).drop(function (err, delOK) {
			var jsondata = JSON.parse(data);
			for (var i = 0; i < jsondata.length; i++) {
				db.collection(collectionname).insert((jsondata[i]), function (err, res) {
					if (err) throw err;
				});
			}
			res.end("Successfully inserted records...");
		});
	});
	res.send("Record insertion is triggered...");
});

app.post("/search", function (req, res) {
	console.log(req.body.query);
	db.collection(collectionname).find({
		"$text": {
			"$search": req.body.query
		}
	},
		{
			textScore: {
				$meta: collectionname
			}
		}).toArray(function (err, items) {
			res.send(items);
		})
});
// Triggered by a POST to /webhook 
app.post('/webhook', function (req, res) {
	var data = req.body;
	// An action is a string used to identify what tasks needs to be done
	// in fulfillment usually based on the corresponding intent.
	var action = data["result"]["action"]
	// Parameters are any entites that DialogFlow API has extracted from the request.
	const parameters = data["result"]["parameters"]
	console.log('result parameters: ' + JSON.stringify(parameters))
	if (action != null) {
		handleAction(action, req, res);
	} else {
		res.json({ "speech": "This is the default case from Webhook" });
	}
});

//For handling actions
function handleAction(action, req, res) {
	switch (action) {
		case 'getInformationByLocation':
			getInformationByLocation(res);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getInformationByLocation from Webhook" });
			break;
		case 'getWinnerByRank':
			getWinnerByRank(res);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getWinnerByRank from Webhook" });
			break;
		case 'getInformationByTopic':
			getInformationByTopic(res);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getInformationByTopic from Webhook" });
			break;
	}
}

//Business API Calls
function getInformationByLocation(res) {
	db.collection(collectionname).find().toArray(function (err, results) {
		console.log(results)
		// send HTML file populated with quotes here
	});
	// var outputBody = {
	// 	"speech": data,
	// 	"displayText": data,
	// 	"data": {},
	// 	"contextOut": [],
	// 	"source": options.url + "_PowerShoppingWebhook"
	// }
	// res.json(outputBody);
}

function getWinnerByRank(req, res) {

}

function getInformationByTopic(req, res) {

}


