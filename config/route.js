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

  '/search/search':{
    'GET':{'path':'/search/search', 'auth':true}
  },
  
  '/search/trending_search':{
    'GET':{'path':'/search/trending_search', 'auth':true}
  },

  '/recommendation/v1.0.0/pratilipis':{
    'GET':{'path':'/recommendation/v1.0.0/pratilipis', 'auth':true}
  },


  '/cont-dep/pag':{
    'GET':{'path':'/cont-dep/pag', 'auth':false}
  },

  '/cont-dep/pwa':{
    'GET':{'path':'/cont-dep/pwa', 'auth':false}
  },

  '/cont-dep/auth':{
    'GET':{'path':'/cont-dep/auth', 'auth':false}
  },

  '/cont-dep/pratilipi':{
    'GET':{'path':'/cont-dep/pratilipi', 'auth':false}
  },

  '/cont-dep/author':{
    'GET':{'path':'/cont-dep/author', 'auth':false}
  },

  '/cont-dep/image':{
    'GET':{'path':'/cont-dep/image', 'auth':false}
  },

  '/cont-dep/search':{
    'GET':{'path':'/cont-dep/search', 'auth':false}
  },

  '/cont-dep/recommendation':{
    'GET':{'path':'/cont-dep/recommendation', 'auth':false}
  }

}
