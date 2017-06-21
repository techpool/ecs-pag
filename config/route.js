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

  '/search':{
    'GET':{'path':'/search','auth':true}
  }

}
