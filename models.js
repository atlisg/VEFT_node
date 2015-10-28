'use strict';

const mongoose = require('mongoose');
const uuid = require('node-uuid');

const UserSchema = mongoose.Schema({
	token: {
		type: String,
		maxlength: 50,
		minlength: 0,
		default: ''
	},
	username: {
		type: String,
		required: true,
		maxlength: 50,
		minlength: 4
	},
	password: {
		type: String,
		required: true,
		maxlength: 50,
		minlength: 4
	},
	email: {
		type: String,
		required: true,
		maxlength: 50,
		minlength: 6
	},
	age: {
		type: Number,
		required: true,
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