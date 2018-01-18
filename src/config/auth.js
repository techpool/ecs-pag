module.exports = {

	// Product

	// Image
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

	'/image/event/banner': {
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


	// Search
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


	// Recommendation
	'/recommendation/pratilipis': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},


	// Pratilipi
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
			'params': [ 'resource', 'method', 'authorId', 'state', 'slug' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'authorId', 'language' ]
		}
	},


	// Author
	'/authors/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'id', 'method' ]
		},
		'PATCH': {
			'params': [ 'resource', 'id', 'method' ]
		}
	},

	'/authors': {
		'GET': {
			'params': [ 'resource', 'method', 'slug' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},

	'/authors/recommendation': {
		'GET': {
			'params': [ 'resource', 'method', 'language' ]
		}
	},


	// UserAuthor / Follow
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


	// UserPratilipi / Review
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


	// Comment
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


	// Vote
	'/vote': {
		'POST': {
			'params': [ 'resource', 'method', 'parentId' ]
		}
	},


	// User
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

	'/user/firebase-token': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/users/v2.0/admins/users/$primaryContentId': {
		'DELETE': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},


	// Event
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

	'/events/v2.0': {
		'GET': {
			'params': [ 'resource', 'method', 'slug' ]
		}
	},


	//Library
	'/userpratilipi/library/list': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/userpratilipi/library': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},


	// Content
	'/pratilipi/content/batch': {
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/pratilipi/content/chapter/add': {
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/pratilipi/content/chapter/delete': {
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/pratilipi/content/index': {
		'GET': {
			'params': [ 'resource', 'method', 'id' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},

	'/pratilipi/content': {
		'GET': {
			'params': [ 'resource', 'method', 'id' ]
		},
		'POST': {
			'params': [ 'resource', 'method', 'id' ]
		}
	},


	// Notification
	'/notification/list': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/notification': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/notification/batch': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},


	// Report
	'/report/v1.0/report': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},


	// Init
	'/init/v1.0/list': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/init/v1.0/init': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},


	// Hacks
	'/library/v1.0/pratilipis/$primaryContentId': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},

	'/social/v2.0/pratilipis/$primaryContentId/reviews/user-review': {
		'GET': {
			'params': [ 'resource', 'method', 'parentId' ]
		}
	},




	// Growth

	// SocialConnect
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
	
	'/template-engine/mobile/homescreen/widgets': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/template-engine/callbacks/activities': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},
		
	// CoverImage
	'/coverimage-recommendation/cover': {
		'GET': {
			'params': [ 'resource', 'method' ]
		}
	},
	
	'/coverimage-recommendation/cover/select': {
		'POST': {
			'params': [ 'resource', 'method' ]
		}
	},


	// BlogScrapper
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
	}

};
