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
const adminToken = '1234a56bcd78901e234fg567';

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('localhost/clipper');
mongoose.connection.once('open', function() {
	console.log('mongoose is connected');
	app.listen(port, () => {
		console.log('Server is on port', port);
	});
});

// Fetching a list of all companies
app.get('/api/company', (req, res) => {
	models.Company.find({}, (err, docs) => {
		if (err) {
			res.status(500).send('Server error.\n');
			return;
		}
		if (docs.length === 0) {
			res.status(404).send(docs);
			return;
		}
		res.status(200).send(docs);
	});
});

// Adding a new company to the app
app.post('/api/company', (req, res) => {
	// Only admin can post
	if (adminToken !== req.headers.token) {
		res.status(401).send("You don't have authorization to add a company.\n");
		return;
	}

	// create company doc from JSON object from body
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
app.get('/api/company/:id', (req, res) => {
	const id = req.params.id;
	models.Company.findOne({ _id: id }, (err, doc) => {
		if (err) {
			res.status(500).send('Server error\n');
			return;
		}
		if (doc) {
			res.status(200).send(doc);
		} else {
			res.status(404).send('No match for company.\n');
		}
		return;
	});
});

// Fetching a list of all users
app.get('/user', (req, res) => {
	models.User.find({}, (err, docs) => {
		if (err) {
			res.status(500).send('Server error\n');
			return;
		}
		if (docs.length === 0) {
			res.status(404).send(docs);
			return;
		}
		// Remove token from each user
		var users = [];
		for (var i = 0; i < docs.length; i++) {
			var user = docs[i].toObject();
			delete user.token;
			users.push(user);
		}
		res.status(200).send(users);
	});
});

// Adding a new user to the app (bonus)
app.post('/user', (req, res) => {
	// Only admin can post
	if (adminToken !== req.headers.token) {
		res.status(401).send("You don't have authorization to add a user.\n");
		return;
	}

	// create user doc from JSON object from body
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

// Adding a new punchcard
app.post('/punchcard/:company_id', (req, res) => {
	// Find user document
	const userToken = req.headers.token;
	models.User.findOne({ 'token': userToken }, (err, doc) => {
		if (err) {
			res.status(500).send('Server error.\n');
			return;
		}
		if (!doc) {
			res.status(401).send("Couldn't find user.\n");
			return;
		}
		var user_id = doc._id;

		// Find company document
		const id = req.params.company_id;
		models.Company.findOne({ _id: id }, (err, doc) => {
			if (err) {
				res.status(500).send('Server error.\n');
				return;
			}
			if (!doc) {
				res.status(404).send("Couldn't find company.\n");
				return;
			}
			var lifetime = doc.punchcard_lifetime;

			// Create punchcard doc from JSON object from body
			var t = req.body;
			t.company_id = id;
			t.user_id = user_id;
			const p = new models.Punchcard(t);
			const now = new Date();

			// Validate data.
			p.validate((err) => {
				if (err) {
					res.status(412).send("Couldn't save punch because payload was invalid.\n");
					return;
				}
				// Chech if the user has a punchcard with the company
				models.Punchcard.findOne( { 
					$and:[ {'user_id': user_id}, {'company_id': id} ]}, (err, doc) => {
					if (err) {
						res.status(500).send('Server error.\n');
						return;
					}
					if (doc) {
						// Check if the punchcard is active
						const diff = now - doc.created;
						var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
//						console.log('time difference in days is', diffDays);
						if (diffDays <= lifetime) {
							res.status(409).send("User has an active punchcard from this company.\n");
							return;
						}
					}
					// Save document
					p.save((err, doc) => {
						if (err) {
							res.status(500).send('Server error.\n');
							return;
						}
						res.status(201).send(doc);
						return;
					});
				});
			});
		});
	});
});

