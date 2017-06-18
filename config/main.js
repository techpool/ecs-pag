var config = {};

config.devo = {
  //todo for ref, delete this later
  // 'ACCESS_TOKEN_DATASTORE_PROJECT': 'devo-pratilipi',
  // 'PRATILIPI_IP_HOST': 'localhost',
  // 'AUTHOR_IP_HOST': 'localhost',
  // 'API_ORCHESTRATOR_PORT': 80,
  // 'LOGGING_PROJECT': 'devo-pratilipi',
  // 'METRIC_PROJECT': 'devo-pratilipi',
  // 'SEARCH_IP_HOST': '52.221.209.219',
  // 'SEARCH_IP_PORT': 2579,
  // 'RECOMMENDATION_IP_HOST': '54.169.153.147',
  // 'ILB_HOST': 'internal-pratilipi-devo-elb-internal-2113898828.ap-southeast-1.elb.amazonaws.com'
  'LOGGING_METRIC_SERVICE_NAME': 'pag-devo-aws',
  'AUTHENTICATION_ENDPOINT': '/auth/authorize'
};

config.gamma = {
  'LOGGING_METRIC_SERVICE_NAME': 'pag-prod-aws',
  'AUTHENTICATION_ENDPOINT': '/auth/authorize'
};

config.prod = {
  'LOGGING_METRIC_SERVICE_NAME': 'pag-prod-aws',
  'AUTHENTICATION_ENDPOINT': '/auth/authorize'
};

module.exports = config;
