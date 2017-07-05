module.exports = {

	'/pratilipi/cover': {
		'GET': { 'path': '/image/pratilipi/cover', 'auth': false, 'shouldPipe': true }
	},

	'/author/image': {
		'GET': { 'path': '/image/author/profile', 'auth': false, 'shouldPipe': true }
	},

	'/author/cover': {
		'GET': { 'path': '/image/author/cover', 'auth': false, 'shouldPipe': true }
	},

	'/image/author/cover': {
		'GET': { 'path': '/image/author/cover', 'auth': false, 'shouldPipe': true }
	},

	'/search': {
		'GET': { 'path': '/search/search', 'auth': true }
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
		'GET': { 'path': '/pages', 'auth': true }
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
					],
				},
				'PATCH': {
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					],
				},
				'POST': {
					'requiredFields': [
						{ 'language': null },
						{ 'type': null }
					],
				}
			}
		}
	},

	'/author':{
		'GET':{ 'path':'/authors', 'auth':false }
	},

	'/user-activity/is_add_to_lib': {
		'GET':{ 'path':'/user-activity/is_add_to_lib', 'auth':false }
	},

	'/user-activity/is_following_author': {
        'GET':{ 'path':'/user-activity/is_following_author', 'auth':false }
	}

};
