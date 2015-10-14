# VEFT_node
Assignments in Node.js in Web services (T-514-VEFT, Vefþjónustur, 2015-3)

## Til að testa:

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