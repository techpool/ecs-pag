module.exports = {

	'/pratilipi/cover': {
		'GET': {
			'path': '/image/pratilipi/cover',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/pratilipi/cover',
			'primaryKey': 'pratilipiId',
			'shouldPipe': true
		}
	},

	'/author/image': {
		'GET': {
			'path': '/image/author/profile',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/author/profile',
			'primaryKey': 'authorId',
			'shouldPipe': true
		}
	},

	'/author/cover': {
		'GET': {
			'path': '/image/author/cover',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/author/cover',
			'primaryKey': 'authorId',
			'shouldPipe': true
		}
	},

	'/search/search': {
		'GET': { 'path': '/search/search', 'auth': true }
	},

	'/search/trending_search': {
		'GET': { 'path': '/search/trending_search', 'auth': true }
	},

	'/recommendation/pratilipis': {
		'GET': { 'path': '/recommendation/pratilipis', 'auth': true }
	},

	'/page': {
		'GET': { 'path': '/pages', 'auth': false }
	},

	'/pratilipi': {
		'GET': {
			'path': '/pratilipis',
			'auth': true,
			'primaryKey': 'pratilipiId'
		},
		'POST': {
			'path': '/pratilipis',
			'methods': {
				'DELETE': {
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null },
						{ 'state': 'DELETED' }
					]
				},
				'PATCH': {
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				},
				'POST': {
					'requiredFields': [
						{ 'language': null },
						{ 'type': null }
					]
				}
			}
		}
	},

	'/author':{
		'GET':{
			'path': '/authors',
			'auth': true,
			'primaryKey': 'authorId'
		},
		'POST': {
			'path': '/authors',
			'methods': {
				'PATCH': {
					'primaryKey': 'authorId',
					'requiredFields': [
						{ 'authorId': null }
					],
				},
				'POST': {
					'requiredFields': [
						{ 'name': null },
						{ 'language': null },
						{ 'userId': 0 } // Only AEEs can add Authors
					]
				}
			}
		}
	},

	'/user-activity/is_add_to_lib': {
		'GET':{ 'path': '/user-activity/is_add_to_lib', 'auth': false }
	},

	'/user-activity/is_following_author': {
		'GET':{ 'path': '/user-activity/is_following_author', 'auth': false }
	},

	'/pratilipi/tags/update': {
		'POST': {
			'path': '/pratilipis',
			'methods': {
                'PATCH': {
                    'primaryKey': 'pratilipiId',
                    'requiredFields': [
                        { 'pratilipiId': null }
                    ]
                }
            }
		}
	}



};
