module.exports = {

  '/pratilipi/cover': {
    'GET':{'path':'/image/pratilipi/cover', 'auth':false, 'bypassPag': true}
  },

  '/author/image':{
    'GET':{'path':'/image/author/profile', 'auth':false, 'bypassPag': true}
  },

  '/author/cover':{
    'GET':{'path':'/image/author/cover', 'auth':false, 'bypassPag': true}
  },

  '/image/author/cover':{
    'GET':{'path':'/image/author/cover', 'auth':false, 'bypassPag': true}
  },

  '/search':{
    'GET':{'path':'/search/search', 'auth':true}
  },

  '/search/search':{
    'GET':{'path':'/search/search', 'auth':true}
  },

  '/search/trending_search':{
    'GET':{'path':'/search/trending_search', 'auth':true}
  },

  '/recommendation/pratilipis':{
    'GET':{'path':'/recommendation/pratilipis', 'auth':true}
  },

  '/pages':{
    'GET':{'path':'/pages', 'auth':false}
  },

  '/pratilipis':{
    'GET':{'path':'/pratilipis', 'auth':false}
  },

  '/authors':{
    'GET':{'path':'/authors', 'auth':false}
  }

};
