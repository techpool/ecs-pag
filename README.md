# ecs-pag

### We are following RESTful url format:
https://en.wikipedia.org/wiki/Representational_state_transfer#Relationship_between_URL_and_HTTP_methods
http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#restful

## Auth Service: 
[[ Not yet decided ]]

## Rest of the services - 
#### Request Headers: Access-Token, User-Id, Version -> Common to GET, POST, PATCH, DELETE
#### Request Body Type: Json
#### Content-Type: application/x-www-form-urlencoded

### GET: id in param
eg: /pratilipis/12345

### GET BATCH: id in query
eg: /pratilipis?id=12345,67890

### POST: data in body
eg: /pratilipis
body: {
	'title': 'yolo',
	'state': 'DRAFTED',
	'blah': 'blah blah'
}

### PATCH: id in param, data in body
eg: /pratilipis/12345
body: {
	'title': 'yolo',
	'state': 'DRAFTED',
	'blah': 'blah blah'
}

### DELETE: id in param
eg: /pratilipis/12345


## Response codes that are supported by PAG: 
200, 201, 207, 400, 401, 403, 404, 500, 502, 504

### List of HTTP Status codes:
https://en.wikipedia.org/wiki/List_of_HTTP_status_codes




