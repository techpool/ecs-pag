module.exports = {

	'/image/pratilipi/cover': {
		'POST': {
			'auth_as': {
				'resource': '/pratilipis',
				'method': 'PATCH'
			}
		}
	},

	'/image/author/profile': {
		'POST': {
			'auth_as': {
				'resource': '/authors',
				'method': 'PATCH'
			}
		}
	},

	'/image/author/cover': {
		'POST': {
			'auth_as': {
				'resource': '/authors',
				'method': 'PATCH'
			}
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
		'POST': {
			'params': [ 'resource', 'method', 'language' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		}
	}

};
