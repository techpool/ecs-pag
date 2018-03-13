module.exports = {

	// Ecs
	'/ecs': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/ecs',
					'auth': false
				}
			}
		}
	},

	'/ecs-gr': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/ecs-gr',
					'auth': false
				}
			}
		}
	},

	// Product

	// Image
	'/pratilipi/cover': {
		'GET': {
			'path': '/image/pratilipi/cover',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/pratilipi/cover',
			'auth': true,
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'pratilipiId'
				}
			}
		}
	},

	'/pratilipi/content/image': {
		'GET': {
			'path': '/image/pratilipi/content',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/pratilipi/content',
			'auth': true,
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
			'auth': true,
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
			'auth': true,
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'authorId'
				}
			}
		}
	},

	'/event/banner': {
		'GET': {
			'path': '/image/event/banner',
			'auth': false,
			'shouldPipe': true
		},
		'POST': {
			'path': '/image/event/banner',
			'auth': true,
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'eventId'
				}
			}
		}
	},

	'/init/banner': {
		'GET': {
			'path': '/image/init/banner',
			'auth': false,
			'shouldPipe': true
		}
	},

	'/author/image/remove': {
		'POST': {
			'methods': {
				'DELETE': {
					'path': '/image/author/$primaryContentId/profile',
					'auth': true,
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
			'methods': {
				'DELETE': {
					'path': '/image/author/$primaryContentId/cover',
					'auth': true,
					'primaryKey': 'authorId',
					'requiredFields': [
						{ 'authorId': null }
					]
				}
			}
		}
	},


	// Search
	'/search': {
		'GET': {
			'path': '/search/search',
			'auth': true
		}
	},

	'/search/search': {
		'GET': {
			'path': '/search/search',
			'auth': true
		}
	},

	'/search/trending_search': {
		'GET': {
			'path': '/search/trending_search',
			'auth': false
		}
	},


	// Recommendation
	'/recommendation/pratilipis': {
		'GET': {
			'path': '/recommendation/pratilipis',
			'auth': true
		}
	},


	// Page
	'/page': {
		'GET': {
			'path': '/pages',
			'auth': false
		}
	},


	// Pratilipi
	'/pratilipi': {
		'GET': {
			'path': '/oasis/v1.0/pratilipis/summary',
			'auth': true
		},
		'POST': {
			'methods': {
				'DELETE': {
					'path': '/pratilipis/$primaryContentId',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{'pratilipiId': null},
						{'state': 'DELETED'}
					]
				},
				'PATCH': {
					'path': '/pratilipis/$primaryContentId',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{'pratilipiId': null}
					]
				},
				'POST': {
					'path': '/pratilipis',
					'auth': true
				}
			}
		}
	},


	'/pratilipis': {
		'GET': {
			'path': '/oasis/v1.0/pratilipis/summary',
			'auth': true
		}
	},

	'/pratilipi/tags/update': {
		'POST': {
			'methods': {
				'PATCH': {
					'path': '/pratilipis/$primaryContentId',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{'pratilipiId': null}
					]
				}
			}
		}
	},

	'/pratilipi/list': {
		'GET': {
			'path': '/pratilipis',
			'auth': true,
			'requiredFields': [
				{'authorId': null}
			],
			'copyParam': [
				{'resultCount': 'limit'}
			]
		}
	},

	// TODO: Remove hack
	'/pratilipi/list/list': {
		'GET': {
			'path': '/init/v1.0/list',
			'auth': true
		}
	},

	'/pratilipi/v2/categories/system': {
		'GET': {
			'path': '/pratilipi/v2/categories/system',
			'auth': false
		}
	},


	// Author
	'/author': {
		'GET': {
			'path': '/authors/$primaryContentId',
			'auth': true,
			'primaryKey': 'authorId'
		},
		'POST': {
			'methods': {
				'PATCH': {
					'path': '/authors/$primaryContentId',
					'auth': true,
					'primaryKey': 'authorId',
					'requiredFields': [
						{'authorId': null}
					],
				},
				'POST': {
					'path': '/authors',
					'auth': true
				}
			}
		}
	},

	'/authors': {
		'GET': {
			'path': '/authors',
			'auth': true
		}
	},

	'/author/recommend': {
		'GET': {
			'path': '/authors/recommendation',
			'auth': true
		}
	},


	// UserAuthor / Follow TODO: Remove requiredFields
	'/userauthor/follow': {
		'GET': {
			'path': '/userauthor/follow',
			'auth': true,
			'requiredFields': [
				{ 'authorId': null }
			]
		},
		'POST': {
			'methods': {
				'POST': {
					'path': '/userauthor/follow',
					'auth': true,
					'requiredFields': [
						{ 'authorId': null }
					]
				}
			}
		}
	},

	'/userauthor/follow/list': {
		'GET': {
			'path': '/userauthor/follow/list',
			'auth': true
		}
	},

	'/follows/isFollowing' : { // TODO: Remove requiredFields
		'GET' : {
			'path' : '/follows/isFollowing',
			'auth': true,
			'requiredFields': [
				{ 'referenceId': null },
				{ 'referenceType': null },
				{ 'userId': null }
			]
		}
	},


	// UserPratilipi / Review
	'/userpratilipi/review/list': {
		'GET': {
			'path': '/userpratilipi/review/list',
			'auth': true
		}
	},

	'/userpratilipi/review': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/userpratilipi/review',
					'auth': true
				}
			}
		}
	},

	'/userpratilipi': {
		'GET': {
			'path': '/userpratilipi',
			'auth': true
		}
	},


	// Comment
	'/comment': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/comment',
					'auth': true
				}
			}
		}
	},

	'/comment/list': {
		'GET': {
			'path': '/comment/list',
			'auth': true
		}
	},


	// Vote
	'/vote': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/vote',
					'auth': true
				}
			}
		}
	},


	// User
	'/user': {
		'GET': {
			'path': '/user',
			'auth': true
		},
		'POST': {
			'methods': {
				'POST': {
					'path': '/user',
					'auth': true
				}
			}
		}
	},

	'/user/register': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/register',
					'auth': true
				}
			}
		}
	},

	'/user/login': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/login',
					'auth': true
				}
			}
		}
	},

	'/user/login/facebook': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/login/facebook',
					'auth': true
				}
			}
		}
	},

	'/user/login/google': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/login/google',
					'auth': true
				}
			}
		}
	},

	'/user/logout': {
		'GET': {
			'path': '/user/logout',
			'auth': true
		}
	},

	'/user/email': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/email',
					'auth': true
				}
			}
		}
	},

	'/user/passwordupdate': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/passwordupdate',
					'auth': true
				}
			}
		}
	},

	'/user/verification': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/verification',
					'auth': true
				}
			}
		}
	},

	'/user/accesstoken': {
		'GET': {
			'path': '/user/accesstoken',
			'auth': false
		}
	},

	'/user/firebase-token': {
		'GET': {
			'path': '/user/firebase-token',
			'auth': true
		}
	},

	'/users/v2.0/admins/users/delete': {
		'POST': {
			'methods': {
				'DELETE': {
					'path': '/users/v2.0/admins/users/$primaryContentId',
					'auth': true,
					'primaryKey': 'userId',
					'requiredFields': [
						{ 'userId': null }
					]
				}
			}
		}
	},


	// Event
	'/event/list': {
		'GET': {
			'path': '/event/list',
			'auth': true
		}
	},

	'/event': {
		'GET': {
			'path': '/event',
			'primaryKey': 'eventId',
			'auth': true
		},
		'POST': {
			'methods': {
				'PATCH': {
					'path': '/event',
					'auth': true,
					'primaryKey': 'eventId',
					'requiredFields': [
						{ 'eventId': null }
					]
				},
				'POST': {
					'path': '/event',
					'auth': true
				}
			}
		}
	},

	'/event/pratilipi': {
		'GET': {
			'path': '/event/pratilipi',
			'auth': true,
			'primaryKey': 'eventId',
			'requiredFields': [
				{ 'eventId': null }
			]
		}
	},

	'/events/v2.0': {
		'GET': {
			'path': '/events/v2.0',
			'auth': true
		}
	},

	//Library
	'/userpratilipi/library/list' : {
		'GET': {
			'path': '/userpratilipi/library/list',
			'auth': true
		}
	},

	'/userpratilipi/library' : { // TODO: Remove requiredFields
		'POST': {
			'methods': {
				'POST' : {
					'path' : '/userpratilipi/library',
					'auth': true,
					'requiredFields': [
						{ 'addedToLib': null }
					]
				}
			}
		}
	},


	// Content
	'/pratilipi/content/batch': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/pratilipi/content/batch',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},

	'/pratilipi/content/chapter/add': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/pratilipi/content/chapter/add',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},

	'/pratilipi/content/chapter/delete': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/pratilipi/content/chapter/delete',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},

	'/pratilipi/content/index': {
		'GET': {
			'path': '/pratilipi/content/index',
			'auth': true,
			'primaryKey': 'pratilipiId',
			'requiredFields': [
				{ 'pratilipiId': null }
			]
		},
		'POST': {
			'methods': {
				'POST': {
					'path': '/pratilipi/content/index',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},

	'/pratilipi/content': {
		'GET': {
			'path': '/pratilipi/content',
			'auth': true,
			'primaryKey': 'pratilipiId',
			'requiredFields': [
				{ 'pratilipiId': null }
			]
		},
		'POST': {
			'methods': {
				'POST': {
					'path': '/pratilipi/content',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},


	// Auth
	'/auth/isAuthorized': {
		'GET': {
			'auth': false,
			'path': '/auth/isAuthorized'
		}
	},


	// Notification
	'/notification/list': {
		'GET': {
			'auth': true,
			'path': '/notification/list'
		}
	},

	'/notification': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/notification',
					'auth': true
				}
			}
		}
	},

	'/notification/batch': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/notification/batch',
					'auth': true
				}
			}
		}
	},


	// Report
	'/contact': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/report/v1.0/report',
					'auth': true
				}
			}
		}
	},


	// Init
	'/init': {
		'GET': {
			'path': '/init/v1.0/init',
			'auth': true
		}
	},

	'/init/v2.0/init': {
		'GET': {
			'path': '/init/v2.0/init',
			'auth': true
		}
	},

	'/truly-madly': {
		'GET': {
			'path': '/init/v1.0/truly-madly',
			'auth': false
		}
	},

	'/init/banner/list': {
		'GET': {
			'path': '/init/v1.0/banner',
			'auth': false
		}
	},


	// User_pratilipi
	'/user_pratilipi/v2.0/user_pratilipis': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user_pratilipi/v2.0/user_pratilipis',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},


	// Hacks
	'/temp/library': {
		'GET': {
			'auth': true,
			'path': '/library/v1.0/pratilipis/$primaryContentId',
			'primaryKey': 'parentId'
		}
	},

	'/temp/social': {
		'GET': {
			'auth': true,
			'path': '/social/v2.0/pratilipis/$primaryContentId/reviews/user-review',
			'primaryKey': 'parentId'
		}
	},

	// Test
	'/pratilipis/metadata': {
		'GET': {
			'path': '/pratilipis/metadata',
			'auth': false
		}
	},

	'/pages/uri': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/pages/uri',
					'auth': false
				}
			}
		}
	},


	// Growth Experiments

	// SocialConnect
	'/social-connect/contact/profile': {
		'GET': {
			'path': '/image/contact/profile',
			'auth': false,
			'shouldPipe': true
		}
	},

	'/social-connect/access_token': {
		'GET': {
			'path': '/social-connect/access_token',
			'auth': true,
		},
		'POST': {
			'methods': {
				'POST': {
					'path': '/social-connect/access_token'
				}
			}
		}
	},

	'/social-connect/access_token/unlink': { // TODO: Remove requiredFields
		'POST': {
			'auth': true,
			'methods': {
				'PATCH': {
					'path': '/social-connect/access_token/unlink',
					'requiredFields': [
						{ 'unlinkSocialAccount': "true" }
					]
				}
			}
		}
	},

	'/social-connect/access_token/remind_me_later': { // TODO: Remove requiredFields
		'POST': {
			'auth': true,
			'methods': {
				'PATCH': {
					'path': '/social-connect/access_token/remind_me_later',
					'requiredFields': [
						{ 'updateLastRemindMeLater': "true" }
					]
				}
			}
		}
	},

	'/social-connect/contacts': {
		'GET': {
			'path': '/social-connect/contacts',
			'auth': true,
		},
		'POST': {
			'auth': true,
			'methods': {
				'POST': {
					'path': '/social-connect/contacts',
					'requiredFields': []
				}
			}
		}
	},

	'/social-connect/contacts/invite': { // TODO: Remove requiredFields
		'POST': {
			'auth': true,
			'methods': {
				'POST': {
					'path': '/social-connect/contacts/invite',
					'requiredFields': []
				}
			}
		}
	},
	
	'/social-connect/contacts/scrape_phone_contacts': { // TODO: Remove requiredFields
		'POST': {
			'auth': true,
			'methods': {
				'POST': {
					'path': '/social-connect/contacts/scrape_phone_contacts'
				}
			}
		}
	},
	
	'/social-connect/referred/by_invitation': {
		'POST': {
			'auth': true,
			'methods': {
				'POST': {
					'path': '/social-connect/referred/by_invitation'
				}
			}
		}
	},

	// Pratilipi Summary
	'/growthjava/pratilipis/metadata': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/growthjava/pratilipis/metadata',
					'auth': false
				}
			}
		}
	},
	
	// Homepage Templating Engine
	'/template-engine/mobile/homescreen/widgets': {
		'GET': {
			'auth': true,
			'path': '/template-engine/mobile/homescreen/widgets'
		}
	},
	
	'/template-engine/callback/activities': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/template-engine/callback/activities',
					'auth': true
				}
			}
		}
	},

	// CoverImage
	'/coverimage-recommendation/cover': {
		'GET': {
			'auth': true,
			'path': '/coverimage-recommendation/cover'
		}
	},

	'/coverimage-recommendation/cover/select': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/coverimage-recommendation/cover/select',
					'auth': true
				}
			}
		}
	},


	// BlogScrapper
	'/blog-scraper/search': {
		'GET': {
			'path': '/blog-scraper/search',
			'auth': true
		}
	},

	'/blog-scraper': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/blog-scraper',
					'auth': true
				}
			}
		},
		'GET': {
			'path': '/blog-scraper',
			'auth': true
		}
	},

	'/blog-scraper/blogpost/list': { // TODO: Remove requiredFields
		'GET': {
			'path': '/blog-scraper/$primaryContentId',
			'auth': true,
			'primaryKey': 'blogId',
			'requiredFields': [
				{ 'blogId': null }
			]
		}
	},

	'/blog-scraper/blogpost/scrape': { // TODO: Remove requiredFields
		'POST': {
			'methods': {
				'POST': {
					'path': '/blog-scraper/$primaryContentId/scrape',
					'auth': true,
					'primaryKey': 'blogId',
					'requiredFields': [
						{ 'blogId': null }
					]
				}
			}
		}
	},

	'/blog-scraper/blogpost/publish': { // TODO: Remove requiredFields
		'POST': {
			'methods': {
				'POST': {
					'path': '/blog-scraper/$primaryContentId/publish',
					'auth': true,
					'primaryKey': 'blogId',
					'requiredFields': [
						{ 'blogId': null }
					]
				}
			}
		}
	},

	'/blog-scraper/blogpost/create': { // TODO: Remove requiredFields
		'POST': {
			'methods': {
				'POST': {
					'path': '/blog-scraper/$primaryContentId/create',
					'auth': true,
					'primaryKey': 'blogId',
					'requiredFields': [
						{ 'blogId': null }
					]
				}
			}
		}
	}

};
