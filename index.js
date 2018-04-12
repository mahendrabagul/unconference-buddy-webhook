'use strict';
// call the packages we need
const express = require('express')
var requestService = require('request');
const bodyParser = require('body-parser');
const fs = require("fs")
const app = express()
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const server = app.listen(process.env.PORT || 5000, () => {
	console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
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
		case 'getInformation':
			//getInformation(res);
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getInformationCall from Webhook" });
			break;
		case 'getWinner':
			res.json({ "speech": "Hello Mahendra, Welcome to Telstra UnConference. This is the sample getWinner from Webhook" });
			break;
	}
}

//Business API Calls
function getInformation(res) {
	var options = {
		method: 'GET',
		url: '',
		headers: {
			"accept": "application/json"
		}
	};
	requestService.get(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body)["data"];
			var outputBody = {
				"speech": data,
				"displayText": data,
				"data": {},
				"contextOut": [],
				"source": options.url + "_PowerShoppingWebhook"
			}
			res.json(outputBody);
		}
	});
}

function getWinner(req, res) {

}



