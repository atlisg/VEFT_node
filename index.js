'use strict';

// Modules
const express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const models = require('./models');

// Globals
const port = 4000;
const app = express();
const companies = [];
const users = [];
const adminToken = '1234a56bcd78901e234fg567';

app.use(bodyParser.json());

mongoose.connect('localhost/clipper');
mongoose.connection.once('open', function() {
	console.log('mongoose is connected');
	app.listen(port, () => {
		console.log('Server is on port', port);
	});
});

// Fetching a list of all companies
app.get('/api/companies', (req, res) => {
	models.Company.find({}, (err, docs) => {
		if (err) {
			res.status(500).send(err);
			return;
		}
		res.status(200).send(docs);
	});
});

// Adding a new company to the app
app.post('/api/companies', (req, res) => {
	// Only admin can post
	if (adminToken !== req.headers.token) {
		res.status(401).send('You don\'t have authorization to add a company.\n');
		return;
	}

	// JSON object from body
	const c = new models.Company(req.body);

	// Validate data.
	c.validate((err) => {
		if (err) {
			res.status(412).send("Couldn't save company because payload was invalid.\n");
			return;
		}
		// Save document
		c.save((err, doc) => {
			if (err) {
				res.status(500).send('Server error.\n');
				return;
			}
			res.status(201).send({ 'company_id': doc._id });
			return;
		});
	});	
});

// Fetch company by id
app.get('/api/companies/:id', (req, res) => {
	const id = req.params.id;
	models.Company.findOne({ _id: id }, (err, doc) => {
		if (err) {
			res.status(500).send(err);
			return;
		}
		if (doc) {
			res.status(200).send(doc);
		} else {
			res.status(404).send(doc);
		}
		return;
	});
});

// Fetching a list of all users
app.get('/api/users', (req, res) => {
	models.User.find({}, (err, docs) => {
		if (err) {
			res.status(500).send(err);
			return;
		}
		res.status(200).send(docs);
	});
});

// Adding a new user to the app
app.post('/api/users', (req, res) => {
	// Only admin can post
	if (adminToken !== req.headers.token) {
		res.status(401).send('You don\'t have authorization to add a user.\n');
		return;
	}

	// JSON object from body
	const u = new models.User(req.body);

	// Validate data.
	u.validate((err) => {
		if (err) {
			res.status(412).send("Couldn't save user because payload was invalid.\n");
			return;
		}
		// Save document
		u.save((err, doc) => {
			if (err) {
				res.status(500).send('Server error.\n');
				return;
			}
			res.status(201).send({ 'user_id': doc._id });
			return;
		});
	});
});

// Fetching a list of all punches for a given user
app.get('/api/users/:id/punches', (req, res) => {
	const query = req.query;
	const id = req.params.id;

	// Find the user in the list
	const userEntry = _.find(users, (user) => {
		return user.id === id;
	});

	if (userEntry) {
		var punches = userEntry.punches;
		// Filter user's punches if requested
		if (query.hasOwnProperty('company')) {
			punches = _.filter(userEntry.punches, (punch) => {
				return punch.cID === req.query.company;
			});
		}
		res.send(punches);
	} else {
		res.status(404).send('No user entry found');
	}
});

// Adding a new punch to a user
app.post('/api/users/:id/punches', (req, res) => {
	const id = req.params.id;
	const data = req.body;

	// Find the user in the list
	const userEntry = _.find(users, (user) => {
		return user.id === id;
	});

	// Find the company in the list
	const companyEntry = _.find(companies, (company) => {
		return company.id === data.id;
	});

	if (userEntry) {
		if (companyEntry) {
			// Create punch object
			var punch = {
				cID: companyEntry.id,
				cName: companyEntry.name,
				timestamp: new Date()
			}

			userEntry.punches.push(punch);
			res.send(userEntry.punches);
		} else {
			res.status(404).send('No company entry found');
		}
	} else {
		res.status(404).send('No user entry found');
	}
});

