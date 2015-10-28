# VEFT_node
Assignments in Node.js in Web services (T-514-VEFT, Vefþjónustur, 2015-3)

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

