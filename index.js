'use strict';

// Modules
const express = require('express');
const mongoose = require('mongoose');
const api = require('./api');
const kafka = require('kafka-node');

const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client();
const producer = new HighLevelProducer(client);

// Globals
const app = express();
const port = 4000;

//const uuid = require('node-uuid');

app.use((req, res, next) => {
	const data = {
		timestamp: new Date(),
		method: req.method,
		headers: req.headers,
		path: req.path,
	};

	//console.log(data);

	next();
});

app.use('/', api);

// Connect to MongoDB
mongoose.connect('localhost/clipper');
mongoose.connection.once('open', function() {
	console.log('mongoose is connected');
	app.listen(port, () => {
		console.log('Server is on port', port);
	});
});

