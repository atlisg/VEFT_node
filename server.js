'use strict';

const BodyParser = require('body-parser');
const express = require('express'),
  kafka = require('kafka-node'),
  app = express(),
  port = 4000;

const HighLevelProducer = kafka.HighLevelProducer;
const client = new kafka.Client('localhost:2181');
const producer = new HighLevelProducer(client);

app.use((req, res, next) => {
  const request_details = {
    'path': req.path,
    'headers': req.headers,
    'method': req.method,
  };

  const data = [{
    topic: 'requests',
    messages: JSON.stringify(request_details),
    }
  ];

  producer.send(data, (err, data) => {
    if (err) {
      console.log('Error:', err);
      return;
    }
    console.log(data);
    next();
  });
});

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.post('/users', BodyParser.json(), (req, res) => {
  const user = req.body;
  console.log(user);

  const payload = [
    {
      topic: 'newusers',
      messages: JSON.stringify(user),
    }
  ];

  producer.send(payload, (err, doc) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    }
    res.send('ok');
  });
});

producer.on('ready', () => {
  console.log('Kafka producer is ready');
  app.listen(port, () => {
    console.log('Server starting on port', port);
  });
});