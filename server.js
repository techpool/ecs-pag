// require( '@google-cloud/trace-agent' ).start();
var http = require('http');
var httpPromise = require('request-promise');
var Promise = require('bluebird');
var express = require('express');

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

//for initializing log object
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
  response.send('Healthy');
});


var getRoutesObject = extractGetRoutes();

app.get(getRoutesObject.getRoutesArrayWithAuth, (request, response, next) => {

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
    res.locals['user-id'] = authResponse.headers['user-id'];
    next();
  })
  .catch((err) => {
    response.status(err.statusCode).send(err.error);
    request.log.error(JSON.stringify(err.error));
    request.log.submit(err.statusCode || 500, err.error.length);
    latencyMetric.write(Date.now() - request.startTimestamp);
  });

});

app.get(getRoutesObject.getRoutesArray, (request, response) => {

  var genericReqOptions = {
    uri: 'http://' + process.env.API_END_POINT + request.url,
    agent : agent,
    resolveWithFullResponse: true
  };

  
  //on its then ie resolve, send req to ILB endpoint with actual request
  //on its then send same response to client
  //on its catch send same error to client  
  
  //if auth is req, pass user Id
  if(getRoutesObject.getRoutesArrayWithAuth.includes(request.path)) {
    genericReqOptions.headers = {
      'User-Id': response.locals['user-id'] //TODO: test for case insensitivity
    };
  }


  var servicePromise = httpPromise(genericReqOptions);

  servicePromise
  .then((serviceResponse) => {
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

});

app.listen(80);


//helper function
function extractGetRoutes() {
  var keys = Object.keys(routeConfig);
  var getRoutesArray = [];
  var getRoutesArrayWithAuth = [];

  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if(routeConfig[key].GET) {
      getRoutesArray.push(routeConfig[key].GET.path);
      if(routeConfig[key].GET.auth) {
        getRoutesArrayWithAuth.push(routeConfig[key].GET.path);
      }
    }
  }
  return {
    getRoutesArray: getRoutesArray,
    getRoutesArrayWithAuth: getRoutesArrayWithAuth
  };
}
