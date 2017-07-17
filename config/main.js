var config = {};

config.devo = {
  'LOGGING_METRIC_SERVICE_NAME': 'ecs-pag-devo',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized'
};

config.gamma = {
  'LOGGING_METRIC_SERVICE_NAME': 'ecs-pag-gamma',
  'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized'
};

config.prod = {
  'LOGGING_METRIC_SERVICE_NAME': 'ecs-pag-prod',
  'AUTHENTICATION_ENDPOINT': '/auth/authorize'
};

module.exports = config;
