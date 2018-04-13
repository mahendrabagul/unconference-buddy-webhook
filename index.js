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
	if (err) throw err;
	db = client.db(database); // whatever your database name is
	db.collection(collectionname, {}, (err, coll) => {
		if (err) throw err;
		db.createCollection(collectionname, (err, result) => {
			if (err) throw err;
			console.log("collection created successfully...");
			db.ensureIndex(collectionname, {
				owner: "text",
				abstract: "text"
			}, (err, indexname) => {
				if (err) throw err;
				console.log("Index created successfully...");
			});
			fs.readFile(datafilename, 'utf8', (err, data) => {
				db.collection(collectionname).drop((err, delOK) => {
					if (err) throw err;
					var jsondata = JSON.parse(data);
					for (var i = 0; i < jsondata.length; i++) {
						db.collection(collectionname).insert((jsondata[i]), (err, res) => {
							if (err) throw err;
						});
					}
				});
			});
			console.log("Successfully inserted records...");
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
app.get('/', (request, response) => {
	res.send('Hello, This is UnConferenceBuddy DialogFlow WebHook')
});

app.get('/admin/load/data', (req, res) => {
	fs.readFile(datafilename, 'utf8', (err, data) => {
		db.collection(collectionname).drop((err, delOK) => {
			if (err) throw err;
			var jsondata = JSON.parse(data);
			for (var i = 0; i < jsondata.length; i++) {
				db.collection(collectionname).insert((jsondata[i]), (err, res) => {
					if (err) throw err;
				});
			}
			res.end("Successfully inserted records...");
		});
	});
	res.send("Record insertion is triggered...");
});

app.post("/search", (req, res) => {
	db.collection(collectionname).find({
		"$text": {
			"$search": req.query.searchTerm
		}
	}).toArray(function (err, result) {
		if (err) throw err;
		res.send(result);
	})
});

// Triggered by a POST to /webhook 
app.post('/webhook', (req, res) => {
	var data = req.body;
	console.log('result parameters: ' + JSON.stringify(data))
	// An action is a string used to identify what tasks needs to be done
	// in fulfillment usually based on the corresponding intent.
	var action = data["result"]["action"]
	// Parameters are any entites that DialogFlow API has extracted from the request.
	const parameters = data["result"]["parameters"]
	console.log('result parameters: ' + JSON.stringify(parameters))
	if (action != null) {
		handleAction(action, req, res, parameters);
	} else {
		res.json({ "speech": "This is the default case from Webhook" });
	}
});

//For handling actions
function handleAction(action, req, res, parameters) {
	switch (action) {
		case 'getInformationByLocation':
			getInformationByLocation(req, res, parameters);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getInformationByLocation from Webhook" });
			break;
		case 'getWinnerByRank':
			getWinnerByRank(req, res);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getWinnerByRank from Webhook" });
			break;
		case 'getInformationByTopic':
			getInformationByTopic(req, res);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getInformationByTopic from Webhook" });
			break;
	}
}

//Business API Calls
function getInformationByLocation(req, res, parameters) {
	console.log(parameters);
	db.collection(collectionname).find({ location: location }).toArray((err, results) => {
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


