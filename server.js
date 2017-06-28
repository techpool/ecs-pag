var http = require('http');
var httpPromise = require('request-promise');
var requestModule = require('request');
var Promise = require('bluebird');
var express = require('express');
var _ = require('lodash');
const morgan = require('morgan');

var agent = new http.Agent({
  keepAlive : true
});

const mainConfig = require('./config/main')[process.env.STAGE];
const routeConfig = require('./config/route');

const Logging = require('./lib/LoggingGcp.js').init({
  projectId: process.env.GCP_PROJ_ID,
  service: mainConfig.LOGGING_METRIC_SERVICE_NAME
});

const Metric = require('./lib/MetricGcp.js').init({
  projectId: process.env.GCP_PROJ_ID,
  service: mainConfig.LOGGING_METRIC_SERVICE_NAME
});

const latencyMetric = new Metric('int64', 'Latency');

const app = express();

app.use(morgan('short'));
// for initializing log object
app.use((request, response, next) => {
  var log = request.log = new Logging( request );
  request.startTimestamp = Date.now();
  next();
});

//CORS middleware
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', "*"); //todo add only pratilipi origin
  response.header('Access-Control-Allow-Credentials', true);
  response.header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
  response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccessToken, Origin, Version');
  next();
});

app.options("/*", function(request, response, next){
  response.send(200);
});

app.get("/health", function(request, response, next){
  response.send('Healthy from stage' + process.env.STAGE || 'nil' );
});

//auth middleware
app.get(['/*'], (request, response, next) => {

  var api = request.path.startsWith('/api/')
    ? request.path.substr(4)
    : request.path;

  if(routeConfig[api] && routeConfig[api].GET.bypassPag) {
    
    var urlSuffix = request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : ''; 
    var uriNew = routeConfig[api].GET.path + urlSuffix;
    var url = 'http://' + process.env.API_END_POINT + uriNew;
    request.pipe(requestModule(url))
      .on('error', function(error){
        console.log(JSON.stringify(error));
        response.status(error.statusCode || 500).send(error.message || 'There was an error forwarding the request!');
      })
      .pipe(response)
      .on('error', function(error){
        console.log(JSON.stringify(error));
        response.status(error.statusCode || 500).send(error.message || 'There was an error forwarding the response!');
      })
      ;
        
  } else if(routeConfig[api] && routeConfig[api].GET.auth) {
    request.log.info('Sending authentication request');
    response.header('Content-Type','application/json');
    var authOptions = {
      uri: 'http://' + process.env.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT, // TODO: test it as well that api is getting subs here
      agent : agent,
      headers: {
      // because auth service requires it
      'AccessToken': request.headers.accesstoken 
      },
      resolveWithFullResponse: true
    };

    // first send request to auth service with httpPromise and accessToken Header
    // on its reject forward same response to client with 403
    var authPromise = httpPromise(authOptions)
    .then(authResponse => {
      response.locals['user-id'] = authResponse.headers['user-id'];
      request.log.info('Authenticated');
      next();
    })
    .catch((err) => {
      response.status(err.statusCode).send(err.error);
      request.log.error(JSON.stringify(err.error));
      request.log.submit(err.statusCode || 500, err.error.length);
      latencyMetric.write(Date.now() - request.startTimestamp);
    });
  } else {
    next();
  }


});

app.get(['/*'], (request, response, next) => {

  var api = request.path.startsWith('/api/')
    ? request.path.substr(4)
    : request.path;
  
  if(routeConfig[api] && routeConfig[api].GET) {
    var urlSuffix = request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : ''; 
    var uriNew = routeConfig[api].GET.path + urlSuffix;
    var genericReqOptions = {
      uri: 'http://' + process.env.API_END_POINT + uriNew,
      agent : agent,
      resolveWithFullResponse: true
    };

    request.log.info('Sending request on ' + genericReqOptions.uri);

    //on its then ie resolve, send req to ILB endpoint with actual request
    //on its then send same response to client
    //on its catch send same error to client  
    
    //if auth is req, pass user Id
    if(routeConfig[request.path] && routeConfig[request.path].GET.auth) {
      genericReqOptions.headers = {
        'User-Id': response.locals['user-id'] //TODO: test for case insensitivity
      };
    }

    var servicePromise = httpPromise(genericReqOptions);
    servicePromise
    .then((serviceResponse) => {
      addRespectiveServiceHeaders(response, serviceResponse.headers);
      response.status(serviceResponse.statusCode).send(serviceResponse.body);
      return serviceResponse;
    })
    .then((serviceResponse) => {
      request.log.submit( serviceResponse.statusCode, JSON.stringify(serviceResponse.body).length);
      latencyMetric.write(Date.now() - request.startTimestamp);
    })
    .catch((err) => {
      response.status(err.statusCode).send(err.error);
      request.log.error(JSON.stringify(err.error));
      request.log.submit(err.statusCode || 500, err.error.length);
      latencyMetric.write(Date.now() - request.startTimestamp);
    })
    ;
  } else {
    next();
  }

});

app.listen(80);

function addRespectiveServiceHeaders(response, serviceReturnedHeaders) {
  var pagHeaders = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'];
  var serviceHeaders = _.omit(serviceReturnedHeaders, pagHeaders);
  response.set(serviceHeaders);
}
