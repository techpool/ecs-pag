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

    '/event/banner': {
    	'GET': {
            'path': '/image/event/banner',
            'auth': false,
            'shouldPipe': true
        },
        'POST': {
            'path': '/image/event/banner',
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

    '/pratilipi/content/image': {
        'GET': {
            'path': '/image/pratilipi/content',
            'auth': false,
            'shouldPipe': true
        },
        'POST': {
            'path': '/image/pratilipi/content',
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
			'methods': {
				'DELETE': {
					'path': '/image/author/$primaryContentId/profile',
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
					'primaryKey': 'authorId',
					'requiredFields': [
						{ 'authorId': null }
					]
				}
			}
		}
	},

    '/search': {
        'GET': {'path': '/search/search', 'auth': true}
    },

    '/search/search': {
        'GET': {'path': '/search/search', 'auth': true}
    },

    '/search/trending_search': {
        'GET': {'path': '/search/trending_search', 'auth': false}
    },

    '/recommendation/pratilipis': {
        'GET': {'path': '/recommendation/pratilipis', 'auth': false}
    },

    '/page': {
        'GET': {'path': '/pages', 'auth': false}
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
                        {'pratilipiId': null},
                        {'state': 'DELETED'}
                    ]
                },
                'PATCH': {
                    'path': '/pratilipis/$primaryContentId',
                    'primaryKey': 'pratilipiId',
                    'requiredFields': [
                        {'pratilipiId': null}
                    ]
                },
                'POST': {
                    'path': '/pratilipis',
                    'requiredFields': [
                        {'language': null},
                        {'type': null}
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
                        {'authorId': null}
                    ],
                },
                'POST': {
                    'path': '/authors',
                    'requiredFields': [
                        {'language': null}
                    ]
                }
            }
        }
    },

    '/authorNew': {
        'GET': {
            'path': '/authors',
            'auth': false
        }
    },

	'/author/recommend': {
		'GET': {
			'path': '/authors/recommendation',
			'auth': true
		}
	},

	'/user-activity/is_add_to_lib': {
		'GET': { 'path': '/user-activity/is_add_to_lib', 'auth': false }
	},

    '/user-activity/is_following_author': {
        'GET': {'path': '/user-activity/is_following_author', 'auth': false}
    },

    '/pratilipi/tags/update': {
        'POST': {
            'methods': {
                'PATCH': {
                    'path': '/pratilipis/$primaryContentId',
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
                {'authorId': null},
                {'state': null},
                {'_apiVer': "3"}
            ],
            'copyParam': [
                {'resultCount': 'limit'}
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
					'path': '/social-connect/access_token',
					'requiredFields': []
				}
			}
		}
	},

	'/social-connect/access_token/unlink': {
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

	'/social-connect/access_token/remind_me_later': {
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
		}
	},

	'/social-connect/contacts/invite': {
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
	
	'/coverimage-recommendation/cover': {
		'GET': {
			'auth': false,
			'path': '/coverimage-recommendation/cover',
		}
	},
	
	'/coverimage-recommendation/cover/select': {
		'POST': {
			'auth': true,
			'methods': {
				'POST': {
					'path': '/coverimage-recommendation/cover/select'
				}
			}
		}
	},

	'/auth/isAuthorized': {
		'GET': {
			'auth': false,
			'path': '/auth/isAuthorized'
		}
	},

	// Hack
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

	'/notification/list': {
		'GET': {
			'auth': true,
			'path': '/notification/list'
		}
	},

	'/notification': {
		'POST': {
			'auth': true,
			'methods': {
				'POST': {
					'path': '/notification',
					'requiredFields': [
						{ 'notificationId': null },
						{ 'state': null }
					]
				}
			}
		}
	}
	
};
