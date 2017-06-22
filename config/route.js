module.exports = {

  '/pratilipi/cover': {
    'GET':{'path':'/image/pratilipi/cover','auth':false}
  },

  '/author/image':{
    'GET':{'path':'/image/author/profile','auth':false}
  },

  '/author/cover':{
    'GET':{'path':'/image/author/cover','auth':false}
  },

  '/search/search':{
    'GET':{'path':'/search/search','auth':true}
  },
  
  '/search/trending_search':{
    'GET':{'path':'/search/trending_search','auth':true}
  },

  '/recommendation/v1.0.0/pratilipis':{
    'GET':{'path':'/recommendation/v1.0.0/pratilipis','auth':true}
  },

  '/cont-dep':{
    'GET':{'path':'/cont-dep','auth':false}
  }

}
