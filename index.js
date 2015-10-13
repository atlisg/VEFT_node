'use strict';

const express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
const _ = require('lodash');

const port = 4000;
const app = express();
const companies = [];
const users = [];

app.use(bodyParser.json());

app.get('/api/companies', (req, res) => {
	res.send(companies);
});

app.post('/api/companies', (req, res) => {
	const data = req.body;

	if (!data.hasOwnProperty('name')) {
		res.status(412).send('missing name\n');
		return;
	}

	if (!data.hasOwnProperty('punchCount')) {
		res.status(412).send('missing punchCount\n');
		return;
	}

	data.timestamp = new Date();
	data.id = uuid.v4();

	companies.push(data);
	res.status(201).send(data);
});

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

app.get('/api/users', (req, res) => {
	res.send(users);
});

app.post('/api/users', (req, res) => {
	const data = req.body;

	if (!data.hasOwnProperty('name')) {
		res.status(412).send('missing name\n');
		return;
	}

	if (!data.hasOwnProperty('email')) {
		res.status(412).send('missing email\n');
		return;
	}

	data.timestamp = new Date();
	data.id = uuid.v4();
	data.punches = [];

	users.push(data);
	res.status(201).send(data);
});

app.get('/api/users/:id/punches', (req, res) => {
	const id = req.params.id;

	const userEntry = _.find(users, (user) => {
		return user.id === id;
	});

	if (userEntry) {
		res.send(userEntry.punches);
	} else {
		res.status(404).send('No user entry found');
	}
});

app.post('/api/users/:id/punches', (req, res) => {
	const id = req.params.id;
	const data = req.body;

	const userEntry = _.find(users, (user) => {
		return user.id === id;
	});

	const companyEntry = _.find(companies, (company) => {
		return company.id === data.id;
	});

	if (userEntry) {
		if (companyEntry) {
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