module.exports = {

	'/pratilipi/cover': {
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/author/image': {
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/author/cover': {
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

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
