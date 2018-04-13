'use strict';
// call the packages we need
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const app = express();

//database config
var mongoose = require('mongoose');
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
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
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
	// An action is a string used to identify what tasks needs to be done
	// in fulfillment usually based on the corresponding intent.
	var action = data["result"]["action"]
	// Parameters are any entites that DialogFlow API has extracted from the request.
	const parameters = data["result"]["parameters"]
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
			break;
		case 'getWinnerByRank':
			getWinnerByRank(req, res, parameters);
			break;
		case 'getInformationByTopic':
			getInformationByTopic(req, res, parameters);
			break;
		case 'getInformationByPartner':
			getInformationByPartner(req, res, parameters);
			break;
		case 'getInformationByOwner':
			getInformationByOwner(req, res, parameters);
			break;
	}
}
function getDifficultyLevel(level) {
	var difficulty = "Beginner";
	switch (level) {
		case 200:
			difficulty = "Intermediate";
			break;
		case 300:
			difficulty = "Advanced";
			break;
	}
	return difficulty;
}
function initializeSpeech(results) {
	var speech = "";
	if (results.length > 1) {
		speech = "Dear, There are " + results.length + " matching results found. "
	}
	else if (results.length == 1) {
		speech = "Dear, There is 1 matching result found. "
	}
	else {
		speech = "Dear, There is no matching result found. "
	}
	return speech;
}
//Business API Calls
function getInformationByLocation(req, res, parameters) {
	db.collection(collectionname).find({ location: parameters['Location'] }).toArray((err, results) => {
		var speech = initializeSpeech(results);
		var count = 1;
		results.forEach(element => {
			speech += (count++) + ". The topic is " + element.topicName + " and it is a " + getDifficultyLevel(element.level) + " course. That will be presented by " + element.owner + " on " + element.dateAndTime + " ";
		});
		var outputBody = {
			"speech": speech
		}
		res.json(outputBody);
	});
}

function getWinnerByRank(req, res, parameters) {
	var speech = "";
	db.collection(collectionname).findOne({ winner: parseInt(parameters['Winner']) }, function (err, result) {
		if (err) throw err;
		speech = "Dear, At rank " + result.winner + ", The topic is '" + result.topicName + "' which was presented by " + result.owner;
		var outputBody = {
			"speech": speech
		}
		res.json(outputBody);
	});
}

function getInformationByTopic(req, res, parameters) {
	var topic = parameters['Topic'];
	var query =
		{
			topicName: new RegExp(topic, 'i')
		};
	db.collection(collectionname).find(query).toArray((err, results) => {
		var speech = initializeSpeech(results);
		//var speech = "Hi There, There are " + results.length + " matching results. ";
		var count = 1;
		results.forEach(element => {
			speech += (count++) + ". The topic is " + element.topicName + " and it is a " + getDifficultyLevel(element.level) + " course. That will be presented by " + element.owner + " on " + element.dateAndTime + " and the brief about it is that " + element.abstract + " ";
		});
		var outputBody = {
			"speech": speech
		}
		res.json(outputBody);
	});
}

function getInformationByPartner(req, res, parameters) {
	var partner = parameters['Partner'];
	var query =
		{
			partner: new RegExp(partner, 'i')
		};
	db.collection(collectionname).find(query).toArray((err, results) => {
		var speech = initializeSpeech(results);
		var count = 1;
		results.forEach(element => {
			speech += (count++) + ". The topic is " + element.topicName + " and it is a " + getDifficultyLevel(element.level) + " course being presented on " + element.dateAndTime + " and the brief about it is that " + element.abstract + " ";
		});
		var outputBody = {
			"speech": speech
		}
		res.json(outputBody);
	});
}

function getInformationByOwner(req, res, parameters) {
	var owner = parameters['Owner'];
	var query =
		{
			owner: new RegExp(owner, 'i')
		};
	db.collection(collectionname).find(query).toArray((err, results) => {
		var speech = initializeSpeech(results);
		var count = 1;
		results.forEach(element => {
			speech += (count++) + ". The topic is " + element.topicName + " and it is a " + getDifficultyLevel(element.level) + " course being presented on " + element.dateAndTime + " and the brief about it is that " + element.abstract + " ";
		});
		var outputBody = {
			"speech": speech
		}
		res.json(outputBody);
	});
}


