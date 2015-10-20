'use strict';

// Modules
const express = require('express');
const mongoose = require('mongoose');
const api = require('./api');

// Globals
const app = express();
const port = 4000;

//const uuid = require('node-uuid');

app.use('/', api);

// Connect to MongoDB
mongoose.connect('localhost/clipper');
mongoose.connection.once('open', function() {
	console.log('mongoose is connected');
	app.listen(port, () => {
		console.log('Server is on port', port);
	});
});