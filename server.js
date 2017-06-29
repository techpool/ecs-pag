var http = require( 'http' );
var httpPromise = require( 'request-promise' );
var requestModule = require( 'request' );
var Promise = require( 'bluebird' );
var express = require( 'express' );
var _ = require( 'lodash' );

const morgan = require( 'morgan' );
const mainConfig = require( './config/main' )[ process.env.STAGE ];
const routeConfig = require( './config/route' );

const Logging = require( './lib/LoggingGcp.js' ).init({
	projectId: process.env.GCP_PROJ_ID,
	service: mainConfig.LOGGING_METRIC_SERVICE_NAME
});

const Metric = require( './lib/MetricGcp.js' ).init({
	projectId: process.env.GCP_PROJ_ID,
	service: mainConfig.LOGGING_METRIC_SERVICE_NAME
});

const latencyMetric = new Metric( 'int64', 'Latency' );

var httpAgent = new http.Agent({ keepAlive : true });


var authPromise;
function getAuth( request, response ) {

	request.log.info( "getAuth()" );

	if( authPromise )
		return authPromise;

	request.log.info( 'Sending authentication request' );
	response.setHeader( 'Content-Type','application/json' );

	var authOptions = {
		uri: 'http://' + process.env.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT,
		agent : httpAgent,
		headers: { 'AccessToken': request.headers.accesstoken },
		resolveWithFullResponse: true
	};

	authPromise = httpPromise( authOptions );
	return authPromise;

}

function resolveGET( request, response ) {

	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	var isAuthRequired = isApiSupported && routeConfig[api].auth;

	request.log.info( "api = " + api );
	request.log.info( "routeConfig = " + JSON.parse( routeConfig ) );
	request.log.info( "routeConfig[api] = " + JSON.parse( routeConfig[api] ) );
	request.log.info( "routeConfig[api].GET = " + routeConfig[api].GET );
	request.log.info( "isApiSupported = " + isApiSupported );
	request.log.info( "routeConfig[api].auth = " + JSON.parse( routeConfig[api].auth ) );
	request.log.info( "isAuthRequired = " + isAuthRequired );

	if( isAuthRequired && ! request.headers.accesstoken ) {
		response.send( "AccessToken is missing in header!" );
		return;
	}

	// Implemented in ecs
	if( isApiSupported ) {

		var urlSuffix = request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '';

		var genericReqOptions = {
			uri: 'http://' + process.env.API_END_POINT + routeConfig[api].GET.path + urlSuffix,
			agent : httpAgent,
			resolveWithFullResponse: true
		};

		var servicePromise = isAuthRequired
					? getAuth( request, response )
					: new Promise( function( resolve, reject ) { resolve(-1); });

		//on its then ie resolve, send req to ILB endpoint with actual request
		//on its then send same response to client
		//on its catch send same error to client
		servicePromise
			.then( authResponse => {
				if( authResponse != -1 ) {
					genericReqOptions.headers = {
						'User-Id': authResponse.headers['user-id']
					};
					request.log.info( 'Authenticated' );
				}
				request.log.info( 'Sending request on ' + genericReqOptions.uri );
				return httpPromise( genericReqOptions );
			})
			.catch( (err) => {
				response.status( err.statusCode ).send( err.error );
				request.log.error( JSON.stringify(err.error) );
				request.log.submit( err.statusCode || 500, err.error.length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.then( (serviceResponse) => {
				addRespectiveServiceHeaders( response, serviceResponse.headers );
				response.status( serviceResponse.statusCode ).send( serviceResponse.body );
				return serviceResponse;
			})
			.then( (serviceResponse) => {
				request.log.submit( serviceResponse.statusCode, JSON.stringify(serviceResponse.body).length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.catch( (err) => {
				response.status( err.statusCode ).send( err.error );
				request.log.error( JSON.stringify(err.error) );
				request.log.submit( err.statusCode || 500, err.error.length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;

	// Forward to appengine -> Supported only on gamma and prod
	} else if( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) {
		request.pipe( requestModule( "https://api.pratilipi.com" + request.url ) )
			.on( 'error', function(error) {
				console.log( JSON.stringify(error) );
				response.status( error.statusCode || 500 ).send( error.message || 'There was an error forwarding the request!' );
			})
			.pipe( response )
			.on( 'error', function(error) {
				console.log( JSON.stringify(error) );
				response.status(error.statusCode || 500).send(error.message || 'There was an error forwarding the response!');
			})
		;
	} else {
		response.send( "Api Not supported yet!" );
	}

}

function resolveGETBatch( request, response ) {

}

function resolvePOST( request, response ) {

}



const app = express();

app.use( morgan('short') );

// for initializing log object
app.use( (request, response, next) => {
	var log = request.log = new Logging( request );
	request.startTimestamp = Date.now();
	next();
});

//CORS middleware
app.use( (request, response, next) => {
	response.setHeader( 'Access-Control-Allow-Origin', "*" ); //todo add only pratilipi origin
	response.setHeader( 'Access-Control-Allow-Credentials', true );
	response.setHeader( 'Access-Control-Allow-Methods', 'GET, OPTIONS, POST' );
	response.setHeader( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, AccessToken, Origin, Version' );
	next();
});

app.options( "/*", (request, response, next) => {
	response.send(200);
});

app.get( "/health", (request, response, next) => {
	response.send( 'Pag ' + process.env.STAGE + ' is healthy !' );
});

// get
app.get( ['/*'], (request, response, next) => {
	if( request.path.startsWith( '/api?' ) ) {
		resolveGETBatch( request, response );
	} else if( request.path.startsWith( '/api/' ) ) {
		resolveGET( request, response );
	}
});

// post
app.post( ['/*'], (request, response, next) => {
	resolvePOST( request, response );
});

app.listen(80);

function addRespectiveServiceHeaders( response, serviceReturnedHeaders ) {
	var pagHeaders = [ 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers' ];
	var serviceHeaders = _.omit( serviceReturnedHeaders, pagHeaders );
	response.set( serviceHeaders );
}
