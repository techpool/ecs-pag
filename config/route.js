module.exports = {

	'/pratilipi/cover': {
		'GET': {
			'path': '/image/pratilipi/cover',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/pratilipi/cover',
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'pratilipiId'
				}
			}
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
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'authorId'
				}
			}
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
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'authorId'
				}
			}
		}
	},

	'/author/image/remove': {
		'POST': {
			'path': '/image/author/$primaryContentId/profile',
			'methods': {
				'DELETE': {
					'primaryKey': 'authorId',
					'requiredFields': [
						{ 'authorId': null }
					]
				}
			}
		}
	},

	'/author/cover/remove': {
		'POST': {
			'path': '/image/author/$primaryContentId/cover',
			'methods': {
				'DELETE': {
					'primaryKey': 'authorId',
					'requiredFields': [
						{ 'authorId': null }
					]
				}
			}
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
			'path': '/pratilipis/$primaryContentId',
			'auth': true,
			'primaryKey': 'pratilipiId'
		},
		'POST': {
			'methods': {
				'DELETE': {
					'path': '/pratilipis/$primaryContentId',
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null },
						{ 'state': 'DELETED' }
					]
				},
				'PATCH': {
					'path': '/pratilipis/$primaryContentId',
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				},
				'POST': {
					'path': '/pratilipis',
					'requiredFields': [
						{ 'title': null },
						{ 'language': null },
						{ 'type': null }
					]
				}
			}
		}
	},

	'/author':{
		'GET':{
			'path': '/authors/$primaryContentId',
			'auth': true,
			'primaryKey': 'authorId'
		},
		'POST': {
			'methods': {
				'PATCH': {
					'path': '/authors/$primaryContentId',
					'primaryKey': 'authorId',
					'requiredFields': [
						{ 'authorId': null }
					],
				},
				'POST': {
					'path': '/authors',
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
			'methods': {
				'PATCH': {
					'path': '/pratilipis/$primaryContentId',
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},

	'/pratilipi/list': {
		'GET':{
			'path': '/pratilipis',
			'auth': true,
			'requiredFields': [
				{ 'authorId': null },
				{ 'state': null }
			],
			'copyParam': [
				{ 'resultCount': 'limit' }
			]
		}
	}

};
