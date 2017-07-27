var config = {};

config.devo = {
  'LOGGING_METRIC_SERVICE_NAME': 'ecs-pag-devo',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
  'APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api'
};

config.gamma = {
  'LOGGING_METRIC_SERVICE_NAME': 'ecs-pag-gamma',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
  'APPENGINE_ENDPOINT': 'https://gae-gamma.pratilipi.com/api'
};

config.prod = {
  'LOGGING_METRIC_SERVICE_NAME': 'ecs-pag-prod',
  'AUTHENTICATION_ENDPOINT': '/auth/authorize',
  'APPENGINE_ENDPOINT': 'https://api.pratilipi.com'
};

module.exports = config;
