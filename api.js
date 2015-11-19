'use strict';

// Modules
const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const kafka = require('kafka-node');
const elasticsearch = require('elasticsearch');

// Globals
const adminToken = '1234a56bcd78901e234fg567';
const api = express();
const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);
const cluster = 'http://localhost:9200/ClusterForPunchy/';
const elasticClient = new elasticsearch.Client({
	host: 'localhost:9200'
});

api.use(bodyParser.json());

api.use((req, res, next) => {
	const request_details = {
		'path': req.path,
		'headers': req.headers,
		'method': req.method,
	};

	const data = [{
		topic: 'users',
		messages: JSON.stringify(request_details),
	}];

	producer.send(data, (err, data) => {
		if (err) {
			console.log('Error:', err);
			return;
		}
		next();
	});
});


// Fetching a list of all companies
api.get('/api/company', (req, res) => {
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

// Adding a new company to the api
api.post('/api/company', (req, res) => {
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
api.get('/api/company/:id', (req, res) => {
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
api.get('/user', (req, res) => {
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
/*		var users = [];
		for (var i = 0; i < docs.length; i++) {
			var user = docs[i].toObject();
			delete user.token;
			users.push(user);
		}
*/		res.status(200).send(docs);
	});
});

// ----------------- start of last assignment -------------------

// Adding a new user to the database
api.post('/user', bodyParser.json(), (req, res) => {
	// create user doc from JSON object from body
	const user = req.body;
	const u = new models.User(user);

	// Validate data.
	u.validate((err) => {
		if (err) {
			res.status(412).send("Couldn't save user because payload was invalid.\n");
			return;
		}
		models.User.findOne({ 'username': user.username }, (err, doc) => {
			if (err) {
				res.status(500).send('Server error.\n');
				return;
			}
			if (doc) {
				res.status(409).send('Could not create user because username already exists.\n');
				return;
			}
			models.User.findOne({ 'email': user.email }, (err, docu) => {
				if (err) {
					res.status(500).send('Server error.\n');
					return;
				}
				if (docu){
					res.status(409).send('Could not create user because email already exists.\n');
					return;
				}
				// Save document
				u.save((err, docum) => {
					if (err) {
						res.status(500).send('Server error.\n');
						return;
					}
					const payload = [
						{
							topic: 'users',
							messages: JSON.stringify(user),
						}
					];
					// Send to producer
					producer.send(payload, (err) => {
						if (err) {
							console.log(err);
							res.status(500).send('Could not write to Kafka topic.\n');
							return;
						}
						res.status(201).send({ 'user_id': docum._id });
						return;
					});
				});
			});
		});
	});
});

// Fetching token
api.post('/token', (req, res) => {
	const body = req.body;
	models.User.findOne({ 'username': body.username }, (err, doc) => {
		if (err) {
			res.status(500).send('Server error.\n');
			return;
		}
		if (!doc) {
			res.status(401).send('No such username.\n');
			return;
		}
		const user = doc.toObject();
		if (user.password !== body.password) {
			res.status(401).send('Wrong password for this user.\n');
			return;
		}
		res.status(201).send({ 'token': user.token });
		return;
	});
});

// ------------------ end of last assignment --------------------

// Adding a new punchcard
api.post('/punchcard/:company_id', (req, res) => {
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

// ----------------- start of current assignment -------------------

// Adding a new company to the api
api.post('/companies', bodyParser.json(), (req, res) => {
	// Only admin can post
	if (adminToken !== req.headers.token) {
		res.status(401).send("You don't have authorization to add a company.\n");
		return;
	}
	// Payload must be JSON
	if (!req.is('application/json')) {
		res.status(415).send("Payload must be a JSON object.");
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

		elasticClient.search({
			'index': 'punchy',
			'type':  'companies',
			'body': {
				'query': {
					"match": {
						'title': c.title
					}
				}
			}
		}).then((doc) => {
			console.log('\nElastic search doc:');
			console.log(doc);
			if (doc.hits.total > 0) {
				res.status(409).send("Company title already taken. Sorry.\n");
				return;
			}
			// Save to MongoDB
			c.save((err, doc) => {
				if (err) {
					res.status(500).send('Server error (mongoDB).\n');
					return;
				}
				console.log('\nmongoDB doc:');
				console.log(doc);
				const data = {
					'id'         : doc._id,
					'title'      : doc.title,
					'description': doc.description,
					'url'        : doc.url,
					'created'    : doc.created
				}
				// Save to Elastic Search
				elasticClient.index({
					'index' : 'punchy',
					'type'  : 'companies',
					'id'    : doc.id,
					'body'  : data
				}).then((respo) => {
					console.log('\nElastic search indexing:')
					console.log(respo);
					res.status(201).send({ 'company_id': respo._id });
					return;
				},(error) => {
					res.status(500).send('Server error (elastic).\n');
					return;
				});
			});
		}, (err) => {
			console.log('err:');
			console.log(err);
		});

		/*elasticClient.searchExists(company, (elasObj) => {
			console.log(elasObj);
			if (elasObj.status !== '404') {
				res.status(409).send("Company title already taken. Sorry.");
			} else {
				
			}
		})*/

		
/*		$.ajax({
			url: {cluster + 'companies/'}/_search,
			dataType: 'jsonp',
			success: function (company) {
				if (company.hits.total > 0) {
					res.status(409).send("Company title already taken. Sorry.");
				} else {
					// Save to MongoDB
					c.save((err, doc) => {
						if (err) {
							res.status(500).send('Server error.\n');
							return;
						}
						// Save to Elastic Search
						
						res.status(201).send({ 'company_id': doc._id });
						return;
					});
				}
			} 
		})*/
	});	
});

// Fetching a list of all companies
api.get('/companies', (req, res) => {
	const size = req.query.size || 20;
	const page = req.query.page || 0;

	elasticClient.search({
			'index'  : 'punchy',
			'type'   : 'companies',
			'size'   : size,
			'from'   : page,
			"_source": [ "id", "title", "description", "url" ],
			'body': {
				'sort': [
					{ 'id': 'asc' }
				]
			}
		}).then((doc) => {
			console.log('doc:');
			console.log(doc);
			res.send(doc.hits.hits.map((d) => d._source));
		}, (err) => {
			res.status(500).send('Server error\n');
		});
});

// Remove company from mongoDB and ElasticSearch
api.delete('/companies:id', (req, res) => {
	// Only admin can delete
	if (adminToken !== req.headers.token) {
		res.status(401).send("You don't have authorization to delete a company.\n");
		return;
	}

	const cid = req.params.id;
	models.Company.remove({ _id: cid }, (err, doc) => {
		if (err) {
			res.status(500).send('Server error\n');
			return;
		}
		if (!doc) {
			res.status(404).send('No match for company.\n');
			return;
		}
		// Found document in mongoDB, now remove it
		
	});

});


// ----------------- end of current assignment -------------------

module.exports = api;




