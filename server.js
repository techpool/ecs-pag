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


function _getUserAuth( request, response ) {

	if( response.locals && response.locals[ 'user-id' ] )
		return new Promise( function( resolve, reject ) { resolve( response.locals[ 'user-id' ] ); });

	if( ! request.headers.accesstoken ) {
		response.status(400).send( "AccessToken is missing in header!" );
		return;
	}

	request.log.info( 'Sending authentication request...' );
	response.setHeader( 'Content-Type','application/json' );

	var authOptions = {
		uri: 'http://' + process.env.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT,
		agent : httpAgent,
		headers: { 'AccessToken': request.headers.accesstoken },
		resolveWithFullResponse: true
	};

	return httpPromise( authOptions )
		.then( authResponse => {
			request.log.info( 'Authenticated!' );
			response.locals[ 'user-id' ] = authResponse.headers['user-id'];
			return response.locals[ 'user-id' ];
		 })
		.catch( (authError) => {
			request.log.info( JSON.stringify( authError.error ) );
			request.log.submit( authError.statusCode || 500, authError.error.length );
			latencyMetric.write( Date.now() - request.startTimestamp );
			response.status( authError.statusCode ).send( authError.error );
		})
	;

}

// uri -> which uri to hit
// request and response -> for auth
// isAuthRequired -> for auth
function _apiGET( uri, request, response, isAuthRequired ) {

	var servicePromise = isAuthRequired
		? _getUserAuth( request, response )
		: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	var genericReqOptions = {
		uri: uri,
		agent : httpAgent,
		resolveWithFullResponse: true
	};
	return servicePromise
		.then( userId => {
			if( userId != -1 ) {
				genericReqOptions.headers = {
					'User-Id': userId
				};
			}
			request.log.info( 'Sending request on ' + genericReqOptions.uri );
			return httpPromise( genericReqOptions );
		})
	;
}

function resolveGET( request, response ) {

	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	var isAuthRequired = isApiSupported && routeConfig[api].GET.auth;

	// Implemented in ecs
	if( isApiSupported ) {
		//on its then ie resolve, send req to ILB endpoint with actual request
		//on its then send same response to client
		//on its catch send same error to client
		var uri = 'http://' + process.env.API_END_POINT + routeConfig[api].GET.path + request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '';
		_apiGET( uri, request, response, isAuthRequired )
			.then( (serviceResponse) => {
				addRespectiveServiceHeaders( response, serviceResponse.headers );
				response.status( serviceResponse.statusCode ).send( serviceResponse.body );
				return serviceResponse;
			})
			.then( (serviceResponse) => {
				request.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.catch( (err) => {
				response.status( err.statusCode ).send( err.error );
				request.log.error( JSON.stringify( err.error ) );
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

	if( ! request.url.startsWith( "/api?requests=" ) )
		response.status( 400 ).send( "Bad Request !" );

	var requests = JSON.parse( decodeURIComponent( request.url.substring( "/api?requests=".length ) ) );
	var requestArray = [];
	for( var req in requests ) {
		if( requests.hasOwnProperty(req) ) {
			var api = requests[req].split( "?" )[0];
			requestArray.push({
				"name": req,
				"url": requests[req],
				"api": api,
				"isSupported": routeConfig[api] != null && routeConfig[api].GET != null,
				"isAuthRequired": routeConfig[api] != null && routeConfig[api].GET != null && routeConfig[api].GET.auth
			});
		}
	}

	var forwardAllToGAE = true;
	for( var i = 0; i < requestArray.length; i++ ) {
		if( requestArray[i]["isSupported"] ) {
			forwardAllToGAE = false;
			break;
		}
	}

	var isAllSupported = true;
	for( var i = 0; i < requestArray.length; i++ ) {
		var api = requestArray[i]["api"];
		if( ! requestArray[i]["isSupported"] ) {
			isAllSupported = false;
			break;
		}
	}

	if( forwardAllToGAE && ( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) ) {
		request.pipe( requestModule( "https://api.pratilipi.com" + request.url ) )
			.on( 'error', function(error) {
				console.log( JSON.stringify(error) );
				response.status( error.statusCode || 500 ).send( error.message || 'There was an error forwarding the request!' );
			})
			.pipe( response )
			.on( 'error', function(error) {
				console.log( JSON.stringify(error) );
				response.status( error.statusCode || 500).send(error.message || 'There was an error forwarding the response!' );
			})
		;

	} else if( process.env.STAGE === 'devo' && ! isAllSupported ) {
		response.send( "Api Not supported yet!" );
		return;

	} else {

		var isParallel = true;
		for( var i = 0; i < requestArray.length; i++ ) {
			if( requestArray[i]["url"].indexOf( "$" ) !== -1 ) {
				isParallel = false;
				break;
			}
		}

		if( isParallel ) {
			var promiseArray = [];
			requestArray.forEach( (req) => {
				var url = req.isSupported
					? 'http://' + process.env.API_END_POINT + routeConfig[req.api].GET.path + req.url.split('?')[1] ? ( '?' + req.url.split('?')[1] ) : ''
					: 'http://api.pratilipi.com' + req.url;
				promiseArray.push( _apiGET( url, request, response, req.isAuthRequired ) );
			});
			Promise.all( promiseArray )
				.then( (responseArray) => { // responseArray will be in order
					var returnResponse = {};
					for( var i = 0; i < responseArray.length; i++ )
						returnResponse[requestArray[i].name] = responseArray[i].body;
					request.log.info( "Success making Batch call!" );
					response.send( returnResponse );
				}).catch( (error) => {
					request.log.info( "Error in Making Batch call!" );
					response.status( 500 ).send( "Some exception occurred at the server! Please try again!" );
				})
			;
		} else {

			var responseObject = {};
			function recursiveGET( reqArray ) {

				if( reqArray.length === 0 )
					return new Promise( function( resolve, reject ) { resolve( responseObject ) } );

				var req = reqArray[0];
				var url = req.isSupported
                    ? 'http://' + process.env.API_END_POINT + routeConfig[req.api].GET.path + req.url.split('?')[1] ? ( '?' + req.url.split('?')[1] ) : ''
                    : 'http://api.pratilipi.com' + req.url;

				return _apiGET( url, request, response, false )
					.then( (res) => {
						var responseJson = JSON.parse( res.body );
						// Modifying reqArray
						reqArray.forEach( (aReq) => {
							for( var key in responseJson ) {
								var find = "$" + req.name + "." + key;
								if( aReq.url.indexOf( find ) !== -1 ) {
									aReq.url = aReq.url.replace( find, responseJson[key] );
								}
							}
						});
						responseObject[ req.name ] = responseJson;
						reqArray.shift();
						return recursiveGET( reqArray );
					})
				;
			}

			recursiveGET( JSON.parse( JSON.stringify( requestArray ) ) ) // Cloning requestArray
				.then( (res) => {
					// TODO: Headers and Response codes
					request.log.submit( 200, JSON.stringify( res ).length );
					latencyMetric.write( Date.now() - request.startTimestamp );
					response.status(200).send( serviceResponse.body );
				});
				.catch( (err) => {
	                response.status( err.statusCode ).send( err.error );
	                request.log.error( JSON.stringify( err.error ) );
	                request.log.submit( err.statusCode || 500, err.error.length );
	                latencyMetric.write( Date.now() - request.startTimestamp );
	            })
			;
		}
	}
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
	if( request.path === '/api' ) {
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
