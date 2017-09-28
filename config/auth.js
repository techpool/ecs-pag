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
		'GET': {
			'params': [ 'resource', 'method', 'authorId', 'state' ]
		},
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
	},

	'/recommendation/pratilipis': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/search/search': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/search/trending_search': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/userauthor/follow': {
		'GET': {
			'params': [ 'resource', 'method', 'authorId' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'authorId' ]
		}
	},

	'/userauthor/follow/list': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/follows/isFollowing': {
		'GET': {
			'params': [ 'resource', 'method', 'referenceId' ]
		}
    },

	'/userpratilipi/review/list': {
		'GET': {
			'params': [ 'resource', 'method', 'pratilipiId' ]
		}
	},

	'/userpratilipi/review': {
		'POST': {
			'params': [ 'resource', 'method', 'pratilipiId' ]
		}
	},

	'/userpratilipi': {
		'GET': {
			'params': [ 'resource', 'method', 'pratilipiId' ]
		}
	},

	'/comment': {
		'POST': {
			'params': [ 'resource', 'method', 'commentId' ]
		}
	},

	'/comment/list': {
		'GET': {
			'params': [ 'resource', 'method', 'parentId' ]
		}
	},

	'/vote': {
		'POST': {
			'params': [ 'resource', 'method', 'parentId' ]
		}
	},
	
	'/blog-scrapper/search': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scrapper': {
		'POST': {
			'params': [ 'resource', 'method', 'language' ]
		},
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scrapper/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},
	
	'/blog-scrapper/$primaryContentId/scrap': {
		'GET': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},
	
	'/blog-scrapper/$primaryContentId/publish': {
		'GET': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},
	
	'/blog-scrapper/$primaryContentId/create': {
		'GET': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},
};
