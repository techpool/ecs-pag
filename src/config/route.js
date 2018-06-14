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

	// Image
	'/image/pratilipi/cover_recommendation': {
		'GET': {
			'path': '/image/pratilipi/cover_recommendation',
			'auth': false,
			'shouldPipe': true
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
			'path': '/search/v2.0/search',
			// 'path': '/search/search',
			'auth': true
		}
	},

	'/search/search': {
		'GET': {
			'path': '/search/v2.0/search',
			// 'path': '/search/search',
			'auth': true
		}
	},

	'/search/trending_search': {
		'GET': {
			'path': '/search/v2.0/trending_search',
			// 'path': '/search/trending_search',
			'auth': false
		}
	},

	'/search/v2.0/search': {
		'GET': {
			'path': '/search/v2.0/search',
			// 'path': '/search/search',
			'auth': true
		}
	},

	'/search/v2.0/trending_search': {
			'GET': {
				'path': '/search/v2.0/trending_search',
				// 'path': '/search/trending_search',
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
	
	// Test on gamma. Remove asap
	'/recommendation/v1.0/pratilipis/newsletter': {
		'GET': {
			'path': '/recommendation/v1.0/pratilipis/newsletter',
			'auth': false
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
			'auth': true,
      'primaryKey': 'pratilipiId'
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

	'/users/v2.0/identifiers/is-valid': {
		'GET': {
			'path': '/users/v2.0/identifiers/is-valid',
			'auth': true
		}
	},

	'/users/v2.0/sessions/login': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/users/v2.0/sessions/login',
					'auth': true
				}
			}
		}
	},

	'/users/v2.0/sessions/signup': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/users/v2.0/sessions/signup',
					'auth': true
				}
			}
		}
	},

	'/users/v2.0/passwords/forgot/intent': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/users/v2.0/passwords/forgot/intent',
					'auth': true
				}
			}
		}
	},

	'/users/v2.0/passwords/reset': {
		'POST': {
			'methods': {
				'PATCH': {
					'path': '/users/v2.0/passwords/reset',
					'auth': true
				}
			}
		}
	},

	'/users/v2.0/sessions/logout': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/users/v2.0/sessions/logout',
					'auth': true
				}
			}
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
	/*
	'/web/reader/v1.0/readerChapter': {
		'GET': {
			'path': '/web/reader/v1.0/readerChapter',
			'auth': true
		}
	},

	'/web/reader/v1.0/readerBatch': {
		'GET': {
			'path': '/web/reader/v1.0/readerBatch',
			'auth': true
		}
	},
	*/

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

	'/content/v1.0/contents/clipped': {
		'GET': {
			'path': '/content/v1.0/contents/clipped',
			'auth': true
		}
	},
	
	'/content/dummy': {
		'GET': {
			'path': '/content/dummy',
			'auth': false
		}	
	},

	// Auth
	'/auth/isAuthorized': {
		'GET': {
			'auth': false,
			'path': '/auth/isAuthorized'
		}
	},

	// WebPush
	'/web-push/fcmToken': { // TODO: Auth true
		'POST': {
			'methods': {
				'POST': {
					'path': '/devices/web',
					'auth': false
				}
			}
		}
	},

	// Temporary Api until Growth is moved to Mumbai
	'/auth/accessToken': {
		'POST': {
			'methods': {
				'DELETE': {
					'path': '/auth/accessToken',
					'auth': false
				}
			}
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

	'/recommendations/v2.0/pratilipis': {
		'GET': {
			'path': '/recommendations/v2.0/pratilipis',
			'auth': true
		}
	},

	'/recommendations/v2.1/pratilipis': {
		'GET': {
			'path': '/recommendations/v2.1/pratilipis',
			'auth': true
		}
	},

	'/init/banner/list': {
		'GET': {
			'path': '/init/v1.0/banner',
			'auth': false
		}
	},

	// User_pratilipi
	'/user_pratilipi/v2.1/user_pratilipis/history': {
		'GET': {
			'path': '/oasis/v1.0/user_pratilipis/history',
			'auth': true,
		},
		'POST': {
			'methods': {
				'DELETE': {
					'path': '/user_pratilipi/v2.1/user_pratilipis/history/$primaryContentId',
					'auth': true,
					'primaryKey': 'pratilipiId',
					'requiredFields': [
						{ 'pratilipiId': null }
					]
				}
			}
		}
	},

  '/user_pratilipi/v2.1/user_pratilipis/history/clear': {
    'POST': {
      'methods': {
        'DELETE': {
          'path': '/user_pratilipi/v2.1/user_pratilipis/history/clear',
          'auth': true
        }
      }
    }
  },

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

  '/user_pratilipi/v2.1/user_pratilipis': {
    'POST': {
      'methods': {
        'POST': {
          'path': '/user_pratilipi/v2.1/user_pratilipis',
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

	// Blogs
	'/blogs/v1.0': {
		'GET': {
			'path':'/oasis/blogs/v1.0',
			'auth': true
		}
	},

	'/blogs/v1.0/list': {
		'GET': {
			'path':'/oasis/blogs/v1.0/list',
			'auth': true
		}
	},

	// Author-Interviews
	'/author-interviews/v1.0': {
		'GET': {
			'path':'/oasis/author-interviews/v1.0',
			'auth': true
		}
	},

	'/author-interviews/v1.0/list': {
		'GET': {
			'path':'/oasis/author-interviews/v1.0/list',
			'auth': true
		}
	},

	'/image_manager/link_image_to_pratilipi': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/image_manager/link_image_to_pratilipi',
					'auth': false
				}
			}
		}
	},

	// Image-Manager Recommendation
	'/image_manager/recommendation': {
		'GET': {
			'path':'/image_manager/recommendation',
			'auth': true
		}
	},

	// Growth Experiments

	// SocialConnect
	'/social-connect/contact/profile': {
		'GET': {
			'isGrowth': true,
			'path': '/image/contact/profile',
			'auth': false,
			'shouldPipe': true
		}
	},

	'/social-connect/access_token': {
		'GET': {
			'isGrowth': true,
			'path': '/social-connect/access_token',
			'auth': true,
		},
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'path': '/social-connect/access_token'
				}
			}
		}
	},

	'/social-connect/access_token/unlink': { // TODO: Remove requiredFields
		'POST': {
			'isGrowth': true,
			'methods': {
				'PATCH': {
					'auth': true,
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
			'isGrowth': true,
			'methods': {
				'PATCH': {
					'auth': true,
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
			'isGrowth': true,
			'path': '/social-connect/contacts',
			'auth': true
		},
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'auth': true,
					'path': '/social-connect/contacts',
					'requiredFields': []
				}
			}
		}
	},

	'/social-connect/contacts/invite': {
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'auth': true,
					'path': '/social-connect/contacts/invite'
				}
			}
		}
	},
	
	'/social-connect/contacts/scrape_phone_contacts': {
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'auth': true,
					'path': '/social-connect/contacts/scrape_phone_contacts'
				}
			}
		}
	},
	
	'/social-connect/referred/by_invitation': {
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'auth': true,
					'path': '/social-connect/referred/by_invitation'
				}
			}
		}
	},

	// Pratilipi Summary
	'/growthjava/pratilipis/metadata': {
		'POST': {
			'isGrowth': true,
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
			'isGrowth': true,
			'auth': true,
			'path': '/template-engine/mobile/homescreen/widgets'
		}
	},
	
	'/template-engine/callback/activities': {
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'path': '/template-engine/callback/activities',
					'auth': true
				}
			}
		}
	},

	
	// Event Participate
	'/event-participate/images': {
		'POST': {
			'path': '/event-participate/images',
			'isGrowth': true,
			'auth': true,
			'shouldPipe': true,
			'methods': {
				'POST': {
					'primaryKey': 'eventId'
				}
			}
		}
	},
	
	'/event-participate/admin/list': {
		'GET': {
			'isGrowth': true,
			'auth': true,
			'path': '/event-participate/admin/list'
		}
	},
	
	'/event-participate/admin/publish': {
		'POST': {
			'isGrowth': true,
			'methods': {
				'POST': {
					'path': '/event-participate/admin/publish',
					'auth': true
				}
			}
		}
	},
	
	
	'/event-participate/admin/metadata': {
		'GET': {
			'isGrowth': true,
			'auth': true,
			'path': '/event-participate/admin/metadata/$primaryContentId',
			'primaryKey': 'eventPratilipiId'
		},
		'POST': {
			'isGrowth': true,
			'methods': {
				'PATCH': {
					'path': '/event-participate/admin/metadata/$primaryContentId',
					'auth': true,
					'primaryKey': 'eventPratilipiId',
					'requiredFields': [
						{'eventPratilipiId': null}
					]
				}
			}
		}
	},

	
	'/event-participate/list': {
		'GET': {
			'isGrowth': true,
			'auth': true,
			'path': '/event-participate/list'
		}
	},

	'/event-participate/metadata': {
		'GET': {
			'isGrowth': true,
			'auth': true,
			'path': '/event-participate/metadata/$primaryContentId',
			'primaryKey': 'eventPratilipiId'
		},
		'POST': {
			'isGrowth': true,
			'methods': {
				'PATCH': {
					'path': '/event-participate/metadata/$primaryContentId',
					'auth': true,
					'primaryKey': 'eventPratilipiId',
					'requiredFields': [
						{'eventPratilipiId': null}
					]
				},
				'POST': {
					'path': '/event-participate/metadata',
					'auth': true
				}
			}
		}
	},
	
	'/event-participate/content': {
		'POST': {
			'isGrowth': true,
			'path': '/event-participate/content/$primaryContentId',
			'auth': true,
			'primaryKey': 'eventPratilipiId',
			'methods': {
				'POST': {
					'primaryKey': 'eventPratilipiId',
					'path': '/event-participate/content/$primaryContentId',
					'requiredFields': [
						{'eventPratilipiId': null}
					],
					'auth': true
				}
			}
		},
		'GET': {
			'isGrowth': true,
			'path': '/event-participate/content/$primaryContentId',
			'auth': true,
			'primaryKey': 'eventPratilipiId'
		}
	},
	
	
	// CoverImage
	'/coverimage-recommendation/cover': {
		'GET': {
			'isGrowth': true,
			'pipeToSgp': true,
			'auth': true,
			'path': '/coverimage-recommendation/cover'
		}
	},

	'/coverimage-recommendation/cover/select': {
		'POST': {
			'isGrowth': true,
			'pipeToSgp': true,
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
			'isGrowth': true,
			'pipeToSgp': true,
			'path': '/blog-scraper/search',
			'auth': true
		}
	},

	'/blog-scraper': {
		'POST': {
			'isGrowth': true,
			'pipeToSgp': true,
			'methods': {
				'POST': {
					'path': '/blog-scraper',
					'auth': true
				}
			}
		},
		'GET': {
			'isGrowth': true,
			'pipeToSgp': true,
			'path': '/blog-scraper',
			'auth': true
		}
	},

	'/blog-scraper/blogpost/list': { // TODO: Remove requiredFields
		'GET': {
			'isGrowth': true,
			'pipeToSgp': true,
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
			'isGrowth': true,
			'pipeToSgp': true,
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
			'isGrowth': true,
			'pipeToSgp': true,
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
			'isGrowth': true,
			'pipeToSgp': true,
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
