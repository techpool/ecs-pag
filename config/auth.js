module.exports = {

	'/pratilipis': {
		'GET': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'authorId' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'DELETE': {
			'params': [ 'resource', 'id', 'method' ]
		}
	}

};
