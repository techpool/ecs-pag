# ecs-pag

Pratilipi Api Gateway (PAG):

Auth Service:
[[ Not yet decided ]]


Rest of the services - We are following RESTful url format:

Request Headers: AccessToken, UserId, Version -> Common to GET, POST, PATCH, DELETE

GET: in param
eg: /pratilipis/12345

GET BATCH: in query
eg: /pratilipis?ids=[123,456]

POST: in body
eg: /pratilipis
body: {
	'title': 'yolo',
	'state': 'DRAFTED',
	'blah': 'blah blah'
}

PATCH: in body
eg: /pratilipis/12345
body: {
	'title': 'yolo',
	'state': 'DRAFTED',
	'blah': 'blah blah'
}

DELETE: in body
eg: /pratilipis/12345


Response codes that are supported by PAG: 
200, 207, 400, 401, 403, 404, 500, 502, 504

