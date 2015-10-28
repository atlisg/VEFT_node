'use strict';

const kafka = require('kafka-node');
const uuid = require('node-uuid');
const mongoose = require('mongoose');
const models = require('./models');

const HighLevelConsumer = kafka.HighLevelConsumer;
const client = new kafka.Client('localhost:2181');
const consumer = new HighLevelConsumer(client,
    [{ topic: 'users' },],
    {
        // the consumer group that this consumer is part of.
        groupId: 'mygroup'
    }
);

// Connect to MongoDB
mongoose.connect('localhost/clipper');
mongoose.connection.once('open', function() {
    console.log('mongoose is connected to consumer.\n');
    consumer.on('message', function(message) {
        //console.log('message', message);
        const value = JSON.parse(message.value);
        if (!value.username) {
            return;
        }
        models.User.update({ 'username': value.username },
                           { $set: { 'token': uuid.v4() } }, (err, doc) => {
            if (err) {
                console.log('Server error.\n');
                return;
            }
            if (!doc) {
                console.log('Consumer could not find user.\n')
                return;
            }
            console.log(doc);
            return;
        });
    });
});
