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

	'/search': {
		'GET': { 'path': '/search/search', 'auth': true }
	},

	'/search/search': {
		'GET': { 'path': '/search/search', 'auth': true }
	},

	'/search/trending_search': {
		'GET': { 'path': '/search/trending_search', 'auth': false }
	},

	'/recommendation/pratilipis': {
		'GET': { 'path': '/recommendation/pratilipis', 'auth': false }
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
						{ 'language': null },
						{ 'type': null }
					]
				}
			}
		}
	},

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
		'GET': { 'path': '/user-activity/is_add_to_lib', 'auth': false }
	},

	'/user-activity/is_following_author': {
		'GET': { 'path': '/user-activity/is_following_author', 'auth': false }
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
		'GET': {
			'path': '/pratilipis',
			'auth': true,
			'requiredFields': [
				{ 'authorId': null },
				{ 'state': null },
				{ '_apiVer': "3" }
			],
			'copyParam': [
				{ 'resultCount': 'limit' }
			]
		}
	},

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

	'/follows/isFollowing' : {
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

	// UserPratilipi Service
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
					'path': '/userpratilipi/review'
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

	'/comment': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/comment'
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

	'/vote': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/vote'
				}
			}
		}
	},

	'/pratilipi/v2/categories/system': {
		'GET': {
			'path': '/pratilipi/v2/categories/system',
			'auth': false
		}
	},


	// User Apis
	'/user': {
		'GET': {
			'path': '/user',
			'auth': false
		},
		'POST': {
			'methods': {
				'POST': {
					'path': '/user',
					'auth': false
				}
			}
		}
	},

	'/user/register': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/register',
					'auth': false
				}
			}
		}
	},

	'/user/login': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/login',
					'auth': false
				}
			}
		}
	},

	'/user/login/facebook': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/login/facebook',
					'auth': false
				}
			}
		}
	},

	'/user/login/google': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/login/google',
					'auth': false
				}
			}
		}
	},

	'/user/logout': {
		'GET': {
			'path': '/user/logout',
			'auth': false
		}
	},

	'/user/email': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/email',
					'auth': false
				}
			}
		}
	},

	'/user/passwordupdate': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/passwordupdate',
					'auth': false
				}
			}
		}
	},

	'/user/verification': {
		'POST': {
			'methods': {
				'POST': {
					'path': '/user/verification',
					'auth': false
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

	'/blog-scraper/blogpost/list': {
		'GET': {
			'path': '/blog-scraper/$primaryContentId',
			'auth': true,
			'primaryKey': 'blogId',
			'requiredFields': [
				{ 'blogId': null }
			]
		}
	},
	
	'/blog-scraper/blogpost/scrape': {
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
	
	'/blog-scraper/blogpost/publish': {
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
	
	'/blog-scraper/blogpost/create': {
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
	},

	// Event Service
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
					'primaryKey': 'eventId',
					'requiredFields': [
						{ 'eventId': null }
					]
				},
				'POST': {
					'path': '/event'
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

	//Library Service
	'/userpratilipi/library/list' : {
		'GET': {
			'path': '/userpratilipi/library/list',
			'auth': true
		}
	},

	//Library Service
	'/userpratilipi/library' : {
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

	'/pratilipi/content/batch': {
			'POST': {
					'methods': {
							'POST': {
									'path': '/pratilipi/content/batch',
									'auth': false
							}
					}
			}
	},

	'/pratilipi/content/chapter/add': {
			'POST': {
					'methods': {
							'POST': {
									'path': '/pratilipi/content/chapter/add',
									'auth': false
							}
					}
			}
	},

	'/pratilipi/content/chapter/delete': {
			'POST': {
					'methods': {
							'POST': {
									'path': '/pratilipi/content/chapter/delete',
									'auth': false
							}
					}
			}
	},

	'/pratilipi/content/index': {
			'GET': {
					'path': '/pratilipi/content/index',
					'auth': false
			},
			'POST': {
					'methods': {
							'POST': {
									'path': '/pratilipi/content/index',
									'auth': false
							}
					}
			}
	},

	'/pratilipi/content': {
			'GET': {
					'path': '/pratilipi/content',
					'auth': false
			},
			'POST': {
					'methods': {
							'POST': {
									'path': '/pratilipi/content',
									'auth': false
							}
					}
			}
	}
};
