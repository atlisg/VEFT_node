'use strict';

const mongoose = require('mongoose');
const uuid = require('node-uuid');

const UserSchema = mongoose.Schema({
	token: {
		type: String,
		default: uuid.v4()
	},
	name: {
		type: String,
		required: true,
		maxlength: 100,
		minlength: 1
	},
	age: {
		type: Number,
		min: 0,
		max: 200
	},
	gender: {
		type: String,
		match: /m|f|o/
	}
});

const CompanySchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 100,
		minlength: 1
	},
	description: {
		type: String,
		maxlength: 2000
	},
	punchcard_lifetime: {
		type: Number,
		required: true,
		min: 0,
		max: 365
	}
});

const PunchcardSchema = mongoose.Schema({
	created: {
		type: Date,
		default: new Date()
	},
	user_id: {
		type: String
	},
	company_id: {
		type: String
	}
});

module.exports = {
	User: mongoose.model('User', UserSchema),
	Company: mongoose.model('Company', CompanySchema),
	Punchcard: mongoose.model('Punchcard', PunchcardSchema)
}