module.exports = {

	'/image/pratilipi/cover': {
		'POST': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/image/author/profile': {
		'POST': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/image/author/cover': {
		'POST': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/image/author/$primaryContentId/profile': {
		'DELETE': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/image/author/$primaryContentId/cover': {
		'DELETE': {
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
		'POST': {
			'params': [ 'resource', 'method', 'language' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		}
	}

};
