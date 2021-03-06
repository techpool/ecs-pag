var config = {};

config.devo = {
  'SERVICE_PORT': 80,
  'GCP_PROJ_ID': process.env.GCP_PROJ_ID,
  'LOGGING_SERVICE_NAME': 'ecs-pag-devo',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
  'API_END_POINT': process.env.API_END_POINT,
  'WEB_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api',
  'ANDROID_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api'
};

config.gamma = {
  'SERVICE_PORT': 80,
  'GCP_PROJ_ID': process.env.GCP_PROJ_ID,
  'LOGGING_SERVICE_NAME': 'ecs-pag-gamma',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
  'API_END_POINT': process.env.API_END_POINT,
  'WEB_APPENGINE_ENDPOINT': 'https://gae-gamma.pratilipi.com/api',
  'ANDROID_APPENGINE_ENDPOINT': 'https://gae-android.pratilipi.com'
};

config.prod = {
  'SERVICE_PORT': 80,
  'GCP_PROJ_ID': process.env.GCP_PROJ_ID,
  'LOGGING_SERVICE_NAME': 'ecs-pag-prod',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
  'API_END_POINT': process.env.API_END_POINT,
  'WEB_APPENGINE_ENDPOINT': 'https://api.pratilipi.com',
  'ANDROID_APPENGINE_ENDPOINT': 'https://gae-android.pratilipi.com'
};

config.local = {
  'SERVICE_PORT': 8080,
  'GCP_PROJ_ID': 'devo-pratilipi',
  'LOGGING_SERVICE_NAME': 'ecs-pag-local',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
  'API_END_POINT': 'localhost',
  'WEB_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api',
  'ANDROID_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api'
};

module.exports = config;
