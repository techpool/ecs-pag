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

	'/pratilipis/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'DELETE': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/pratilipis': {
		'POST': {
			'params': [ 'resource', 'method', 'authorId', 'language' ]
		}
	},

	'/authors/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/authors': {
		'POST': {
			'params': [ 'resource', 'method', 'language' ]
		}
	}

};
