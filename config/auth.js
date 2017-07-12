module.exports = {

	'/pratilipis': {
		'GET': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'authorId', 'language' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'DELETE': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/authors': {
    		'GET': {
    			'params': [ 'resource', 'id', 'method' ]
    		},
    		'PATCH': {
    			'params': [ 'resource', 'id', 'method' ]
    		}
    	}

};
