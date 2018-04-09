var config = {};

config.devo = {
    'SERVICE_PORT': process.env.SERVICE_PORT,
    'GCP_PROJ_ID': process.env.GCP_PROJ_ID,
    'LOGGING_SERVICE_NAME': 'ecs-pag-devo',
    'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
    'API_END_POINT': process.env.API_END_POINT,
    'API_END_POINT_GROWTH': process.env.API_END_POINT_GROWTH,
    'WEB_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api',
    'ANDROID_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api',
    'BIGQUERY_PROJECT': 'devo-pratilipi',
    'BIGQUERY_DATASET': 'DEVO_LOGS',
    'LOGGING_TABLE':'PRATILIPI_LOGS'
};

config.gamma = {
    'SERVICE_PORT': process.env.SERVICE_PORT,
    'GCP_PROJ_ID': process.env.GCP_PROJ_ID,
    'LOGGING_SERVICE_NAME': 'ecs-pag-gamma',
    'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
    'API_END_POINT': process.env.API_END_POINT,
    'API_END_POINT_GROWTH': process.env.API_END_POINT_GROWTH,
    'WEB_APPENGINE_ENDPOINT': 'http://gae-gamma.pratilipi.com/api',
    'ANDROID_APPENGINE_ENDPOINT': 'http://gae-android.pratilipi.com',
    'BIGQUERY_PROJECT': 'pratilipi-157910',
    'BIGQUERY_DATASET': 'DEVO_LOGS',
    'LOGGING_TABLE':'PRATILIPI_LOGS'
};

config.prod = {
    'SERVICE_PORT': process.env.SERVICE_PORT,
    'GCP_PROJ_ID': process.env.GCP_PROJ_ID,
    'LOGGING_SERVICE_NAME': 'ecs-pag-prod',
    'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
    'API_END_POINT': process.env.API_END_POINT,
    'API_END_POINT_GROWTH': process.env.API_END_POINT_GROWTH,
    'WEB_APPENGINE_ENDPOINT': 'http://api.pratilipi.com',
    'ANDROID_APPENGINE_ENDPOINT': 'http://gae-android.pratilipi.com',
    'BIGQUERY_PROJECT': 'pratilipi-157910',
    'BIGQUERY_DATASET': 'DEVO_LOGS',
    'LOGGING_TABLE':'PRATILIPI_LOGS'
};

config.local = {
    'SERVICE_PORT': 8080,
    'GCP_PROJ_ID': 'devo-pratilipi',
    'LOGGING_SERVICE_NAME': 'ecs-pag-local',
    'AUTHENTICATION_ENDPOINT': '/auth/isAuthorized',
    'API_END_POINT': 'https://hindi-devo.ptlp.co/api',
    'API_END_POINT_GROWTH': 'https://hindi-devo.ptlp.co/api',
    'WEB_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api',
    'ANDROID_APPENGINE_ENDPOINT': 'https://devo-pratilipi.appspot.com/api',
    'BIGQUERY_PROJECT': 'devo-pratilipi',
    'BIGQUERY_DATASET': 'DEVO_LOGS',
    'LOGGING_TABLE':'PRATILIPI_LOGS'
};

module.exports = config[ process.env.STAGE || 'local' ];
