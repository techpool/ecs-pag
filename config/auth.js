module.exports = {

	'/image/pratilipi/cover': {
		'POST': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/image/pratilipi/content': {
		'POST': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/image/event/banner': {
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

	'/authors/recommendation': {
		'GET': {
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

	'/user': {
		'GET': {
			'params': [ 'resource', 'method', 'userId' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'userId' ]
		}
	},

	'/user/register': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/login': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/login/facebook': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/login/google': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/logout': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/email': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/passwordupdate': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/user/verification': {
		'POST': {
			'params': [ 'resource', 'method' ]
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
	
	'/blog-scraper/search': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scraper': {
		'POST': {
			'params': [ 'resource', 'method' ]
		},
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scraper/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scraper/$primaryContentId/scrape': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scraper/$primaryContentId/publish': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/blog-scraper/$primaryContentId/create': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/event/list': {
		'GET': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},

	'/event': {
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'POST': {
			'params': [ 'resource', 'method' ]
		},
		'GET': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/event/pratilipi': {
		'GET': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	//Library Service
	'/userpratilipi/library/list': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	//Library Service
	'/userpratilipi/library': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},
	
		'/social-connect/access_token': {
		'GET': {
			'params': [ 'resource', 'method' ]
		},
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/social-connect/access_token/unlink': {
		'PATCH': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/social-connect/access_token/remind_me_later': {
		'PATCH': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/social-connect/contacts' : {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/social-connect/contacts/invite': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/library/v1.0/pratilipis/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/social/v2.0/pratilipis/$primaryContentId/reviews/user-review': {
		'GET': {
			'params': [ 'resource', 'method', 'parentId' ]
		}
	}

};
