'use strict';

// Libraries
const express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
const _ = require('lodash');

// Global variables
const port = 4000;
const app = express();
const companies = [];
const users = [];

app.use(bodyParser.json());

// Fetching a list of all companies
app.get('/api/companies', (req, res) => {
	res.send(companies);
});

// Adding a new company to the app
app.post('/api/companies', (req, res) => {
	// JSON object from body
	const data = req.body;

	// Validate json object
	if (!data.hasOwnProperty('name')) {
		res.status(412).send('missing name\n');
		return;
	}
	if (!data.hasOwnProperty('punchCount')) {
		res.status(412).send('missing punchCount\n');
		return;
	}

	// Add time and id to the company being added
	data.timestamp = new Date();
	data.id = uuid.v4();

	// Add company to list and send response to client
	companies.push(data);
	res.status(201).send(data);
});

// Fetch company by id
app.get('/api/companies/:id', (req, res) => {
	const id = req.params.id;

	const companyEntry = _.find(companies, (company) => {
		return company.id === id;
	});

	if (companyEntry) {
		res.send(companyEntry);
	} else {
		res.status(404).send('No company entry found');
	}
});

// Fetching a list of all users
app.get('/api/users', (req, res) => {
	res.send(users);
});

// Adding a new user to the app
app.post('/api/users', (req, res) => {
	const data = req.body;

	// Validate json object
	if (!data.hasOwnProperty('name')) {
		res.status(412).send('missing name\n');
		return;
	}
	if (!data.hasOwnProperty('email')) {
		res.status(412).send('missing email\n');
		return;
	}

	// Add time, id and an empty list of punches
	// to the user being added
	data.timestamp = new Date();
	data.id = uuid.v4();
	data.punches = [];

	// Add user to list and send response to client
	users.push(data);
	res.status(201).send(data);
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

app.listen(port, () => {
	console.log('Server is on port', port);
});