# VEFT_node
Assignments in Node.js in Web services (T-514-VEFT, Vefþjónustur, 2015-3)

## Assignment 10

### Til að keyra:

1. Install Kafka and Zookeeper (sjá verkefnalýsingu).

2. Install dependencies `npm install`.

3. Start Zookeeper: Verum í Kafka möppunni (hjá okkur: ~/Downloads/kafka_2.9.1-0.8.2.2) og keyrum `bin/zookeeper-server-start.sh config/zookeeper.properties`

4. Start Kafka: Verum í Kafka möppunni og keyrum `bin/kafka-server-start.sh config/server.properties`

5. Búum til nýtt topic: Verum í Kafka möppunni og keyrum `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic users`

6. MongoDB þarf að vera uppsett og keyrandi: `mongod --dbpath {pathForDatabase}` (T.d. `mkdir /tmp/data` svo `mongod --dbpath /tmp/data`)

7. Download Elastic Search. Extract it. Inní þeirri möppu, keyrðu: `bin/elasticsearch`.

8. Keyrðu scriptuna okkar til að hreinsa elastic, `./init`.

9. Keyrum upp serverinn (úr verkefnamöppunni): `node index.js`
Keyra með nodemon: `~/<PathToProjectFolder>/node_modules/nodemon/bin/nodemon.js index.js`

10. Keyrðu upp consumerinn (úr verkefnamöppunni): `node token_consumer.js`
Keyra með nodemon: `~/<PathToProjectFolder>/node_modules/nodemon/bin/nodemon.js token_consumer.js`

### Til að testa:

Keyrðu python scriptuna hans HlySig, sjá [hér](https://github.com/atlisg12/VEFT_node/tree/master/punchy-review).

#### /companies - POST
- curl -XPOST -d "{\"title\": \"VeganBot\", \"url\": \"www.veganbot.com\", \"description\": \"Fighting animal abuse\" }" -H "Content-Type: Application/json" -H "admin_token: 1234a56bcd78901e234fg567" http://localhost:4000/companies
- curl -XPOST -d "{\"title\": \"Enter Iceland\", \"url\": \"www.entericeland.com\", \"description\": \"not sexual\" }" -H "Content-Type: Application/json" -H "admin_token: 1234a56bcd78901e234fg567" http://localhost:4000/companies

#### /companies/ - GET
- curl http://localhost:4000/companies | python -m json.tool

#### /companies[?page=N&max=N] - GET
- curl http://localhost:4000/companies\?page\=1\&max\=1 | python -m json.tool

#### /companies/{id} - GET
- curl http://localhost:4000/companies/{id} | python -m json.tool

#### /companies/{id} - POST (update)
- curl -XPOST -d "{\"url\": \"www.enter-iceland.com\", \"description\": \"NOT sexual I promise.then\" }" -H "Content-Type: Application/json" -H "admin_token: 1234a56bcd78901e234fg567" http://localhost:4000/companies/{id}

#### /companies/{id} - DELETE
- curl -XDELETE -H "admin_token: 1234a56bcd78901e234fg567" http://localhost:4000/companies/{id}

#### /companies/search - POST
- curl -XPOST -d "{ \"search\": \"enter\" }" -H "Content-Type: Application/json" http://localhost:4000/companies/search | python -m json.tool


## Assignment 9

### Til að keyra:

1. Install Kafka and Zookeeper (sjá verkefnalýsingu).

2. Install dependencies `npm install`.

3. Start Zookeeper: Verum í Kafka möppunni (hjá okkur: ~/Downloads/kafka_2.9.1-0.8.2.2) og keyrum `bin/zookeeper-server-start.sh config/zookeeper.properties`

4. Start Kafka: Verum í Kafka möppunni og keyrum `bin/kafka-server-start.sh config/server.properties`

5. Búum til nýtt topic: Verum í Kafka möppunni og keyrum `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic users`

6. MongoDB þarf að vera uppsett og keyrandi: `mongod --dbpath {pathForDatabase}` (T.d. `mkdir /tmp/data` svo `mongod --dbpath /tmp/data`)

7. Keyrum upp serverinn (úr verkefnamöppunni): `node index.js`
Keyra með nodemon: `~/<PathToProjectFolder>/node_modules/nodemon/bin/nodemon.js index.js`

8. Keyrðu upp consumerinn (úr verkefnamöppunni): `node token_consumer.js`
Keyra með nodemon: `~/<PathToProjectFolder>/node_modules/nodemon/bin/nodemon.js token_consumer.js`

### Til að testa:

#### /user - POST
- curl -XPOST -d "{\"username\": \"Aegir\", \"email\": \"aegir@foxy.is\", \"password\": \"pungur\", \"age\": \"23\"}" -H "Content-Type: Application/json" http://localhost:4000/user
- curl -XPOST -d "{\"username\": \"Atli\", \"email\": \"atli@li.is\", \"password\": \"rassar\", \"age\": \"35\"}" -H "Content-Type: Application/json" http://localhost:4000/user

#### /token - POST
- curl -XPOST -d "{\"username\": \"Atli\", \"password\": \"rassar\"}" -H "Content-Type: Application/json" http://localhost:4000/token


## Assignment 8

### Til að keyra:

MongoDB þarf að vera uppsett og keyrandi.

`mongod --dbpath {pathForDatabase}` 

(f.ex: `mkdir /tmp/data` then `mongod --dbpath /tmp/data`)

`npm install`

`node index.js`

Keyra með nodemon:

`~/<PathToProjectFolder>/node_modules/nodemon/bin/nodemon.js index.js`

### Til að testa:

#### /api/company - GET
- curl http://localhost:4000/api/company | python -m json.tool

#### /api/companies - POST
- curl -XPOST -d "{\"name\": \"Vegan bolir ehf.\", \"punchcard_lifetime\": 183}" -H "Content-Type: Application/json" -H "token: 1234a56bcd78901e234fg567" http://localhost:4000/api/company
- curl -XPOST -d "{\"name\": \"Cafee veeegan ehf.\", \"punchcard_lifetime\": 28, \"description\": \"The beeest ceeefe in the feeecking weeeeerld.\"}" -H "Content-Type: Application/json" -H "token: 1234a56bcd78901e234fg567" http://localhost:4000/api/company

#### /api/company/{id} - GET
- curl http://localhost:4000/api/company/{company id} | python -m json.tool

#### /user - GET
- curl http://localhost:4000/user | python -m json.tool

#### /user - POST (bonus)
- curl -XPOST -d "{\"name\": \"Aegir\", \"age\": \"23\"}" -H "Content-Type: Application/json" -H "token: 1234a56bcd78901e234fg567" http://localhost:4000/user
- curl -XPOST -d "{\"name\": \"Atli\"}" -H "Content-Type: Application/json" -H "token: 1234a56bcd78901e234fg567" http://localhost:4000/user

#### /punchcard/{company_id} - POST
- curl -XPOST -d "{}" -H "Content-Type: Application/json" -H "token: {user token}" http://localhost:4000/punchcard/{company id}

Ath: Til að sjá 'user token' hjá notanda, þarf að keyra `mongo`. 
Þar þarf að keyra `use clipper` og `db.users.find()`.
Þá ætti notendalistinn að birtast með token-um.


## Assignment 7

### Til að keyra:

`npm install`

`node index.js`

### Til að testa:

#### /api/companies - GET
- curl http://localhost:4000/api/companies | python -m json.tool

#### /api/companies - POST
- curl -XPOST -d "{\"name\": \"Glo\", \"punchCount\": 5}" -H "Content-Type: Application/json" http://localhost:4000/api/companies
- curl -XPOST -d "{\"name\": \"Fonix\", \"punchCount\": 10}" -H "Content-Type: Application/json" http://localhost:4000/api/companies

#### /api/companies/{id} - GET
- curl http://localhost:4000/api/companies/{company id} | python -m json.tool

#### /api/users/ - GET
- curl http://localhost:4000/api/users | python -m json.tool

#### /api/users/ - POST
- curl -XPOST -d "{\"name\": \"Bergthor\", \"email\": \"bergthor13@ru.is\"}" -H "Content-Type: Application/json" http://localhost:4000/api/users
- curl -XPOST -d "{\"name\": \"Atli\", \"email\": \"atlisg12@ru.is\"}" -H "Content-Type: Application/json" http://localhost:4000/api/users

#### /api/users/{id}/punches - GET
- curl http://localhost:4000/api/users/{user id}/punches | python -m json.tool
- curl http://localhost:4000/api/users/{user id}/punches?company={id} | python -m json.tool

#### /api/users/{id}/punches - POST
- curl -XPOST -d "{\"id\": \"{company id}\"}" -H "Content-Type: Application/json" http://localhost:4000/api/users/{user id}/punches

