var http = require( 'http' );
var httpPromise = require( 'request-promise' );
var requestModule = require( 'request' );
var Promise = require( 'bluebird' );
var express = require( 'express' );
var _ = require( 'lodash' );
var bodyParser = require('body-parser');

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


function _getResponseCode( code ) {
	// TODO: All edge cases
	if( ! code )
		return 500;
	var supportedCodesOnFrontend = [ 200, 400, 401, 404, 500 ];
	if( supportedCodesOnFrontend[ code ] )
		return code;
	else if( code === 403 ) // From Auth Service
		return 401;
	else
		return 500; // Internal Server Exception
}

function _getUserAuth( request, response ) {

	// Calling Auth service for 2 to nth iteration
	if( response.locals && response.locals[ 'user-id' ] )
		return new Promise( function( resolve, reject ) { resolve( response.locals[ 'user-id' ] ); });

	// Bad Request
	if( ! request.headers.accesstoken ) {
		response.status( 400 ).send( "AccessToken is missing in header!" );
		return;
	}

	request.log.info( 'Sending authentication request...' );

	// Services that needed Auth -> Considering it to be in application/json format
	response.setHeader( 'Content-Type','application/json' );

	var authOptions = {
		uri: 'http://' + process.env.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT,
		agent : httpAgent,
		headers: { 'AccessToken': request.headers.accesstoken },
		resolveWithFullResponse: true
	};

	return httpPromise( authOptions )
		.then( authResponse => {
			request.log.info( 'Authenticated !' );
			response.locals[ 'user-id' ] = authResponse.headers['user-id'];
			return response.locals[ 'user-id' ];
		 })
		.catch( (authError) => {
			request.log.info( "Authentication Failed! Message Printed Below:" );
			request.log.info( JSON.stringify( authError.error ) );
			request.log.submit( authError.statusCode || 500, authError.error.length );
			latencyMetric.write( Date.now() - request.startTimestamp );
			response.status( _getResponseCode( authError.statusCode ) ).send( authError.error );
		})
	;

}

// 3 parameters
// uri -> which uri to hit
// request and response -> for auth
// isAuthRequired -> for auth
function _apiGET( uri, request, response, isAuthRequired ) {

	var authPromise = isAuthRequired
		? _getUserAuth( request, response )
		: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	var genericReqOptions = {
		uri: uri,
		agent : httpAgent,
		resolveWithFullResponse: true
	};

	return authPromise
		.then( userId => {
			if( userId != -1 ) {
				genericReqOptions.headers = {
					'User-Id': userId,
					'AccessToken': request.headers.accesstoken
				};
			}
			request.log.info( 'Sending request on ' + genericReqOptions.uri );
			return httpPromise( genericReqOptions );
		})
	;
}

function _apiPOST( uri, request, response, isAuthRequired, methodName ) {

	console.log('got the request from resolvePOST');
	console.log(uri, isAuthRequired, methodName);
	var authPromise = isAuthRequired
		? _getUserAuth( request, response )
		: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	var genericReqOptions = {
		uri: uri,
		method: methodName,
		agent : httpAgent,
		body: request.body,
		json:true,
		resolveWithFullResponse: true
	};

	return authPromise
		.then( userId => {
			if( userId != -1 ) {
				genericReqOptions.headers = {
					'User-Id': userId,
					'AccessToken': request.headers.accesstoken
				};
			}
			request.log.info( 'Sending request on ' + genericReqOptions.uri );
			return httpPromise( genericReqOptions );
		})
	;
}


function resolveGET( request, response ) {

	/*
	*   4 cases:
	*	1. ecs -> without auth (images)
	*   2. ecs -> with auth (other services)
	*   3. not supported in ecs && devo environment -> Send 'not supported'
	*   4. not supported in ecs && ( gamma || prod ) -> Forward request for appengine
	*/

	// request.path will be /api/xxx
	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	var isAuthRequired = isApiSupported && routeConfig[api].GET.auth;
	var isPipeRequired = isApiSupported && routeConfig[api].GET.shouldPipe;

	// For image requests
	if( isPipeRequired ) {
		var urlSuffix = request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : '';
		var uriNew = routeConfig[api].GET.path + urlSuffix;
		var url = 'http://' + process.env.API_END_POINT + uriNew;
		request.pipe( requestModule( url ) )
			.on( 'error', function( error ) {
				response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'There was an error forwarding the request!' );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.pipe( response )
			.on(' error', function( error ) {
				response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'There was an error forwarding the response!' );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;
	// Supported in ecs
	} else if( isApiSupported ) {
		var uri = 'http://' + process.env.API_END_POINT + routeConfig[api].GET.path + ( request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '' );
		_apiGET( uri, request, response, isAuthRequired )
			.then( (serviceResponse) => {
				// TODO: Check addRespectiveServiceHeaders
				addRespectiveServiceHeaders( response, serviceResponse.headers );
				response.status( serviceResponse.statusCode ).send( serviceResponse.body );
				request.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.catch( (err) => {
				response.status( _getResponseCode( err.statusCode ) ).send( err.error );
				request.log.error( JSON.stringify( err.error ) );
				request.log.submit( err.statusCode || 500, err.error.length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;

	// Forward to appengine -> Supported only on gamma and prod
	} else if( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) {
		request.pipe( requestModule( "https://api.pratilipi.com" + request.url ) )
			.on( 'error', (error) => {
				response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'There was an error forwarding the request!' );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.pipe( response )
			.on( 'error', (error) => {
				response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'There was an error forwarding the response!' );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;

	// not supported and devo environment
	} else {
		response.send( "Api Not supported yet!" );
	}

}


function resolveGETBatch( request, response ) {

	/*
		Sample batch call request:
		/api?requests={"req1":"/page?uri=/k-billa-ramesh/en-kanmani","req2":"/pratilipi?_apiVer=2&pratilipiId=$req1.primaryContentId"}

		Cases - Environment:
		1. Devo Environment -> If all requests are not supported, just say NO.
		2. Gamma or prod -> Forward Request to appengine

		Cases - Serial / Parallel :
		1. If all requests are independent -> Use promise.all
		2. Else use sequential promises
	*/

	// Just another bad request
	if( ! request.url.startsWith( "/api?requests=" ) )
		response.status( 400 ).send( "Bad Request !" );

	var requests = JSON.parse( decodeURIComponent( request.url.substring( "/api?requests=".length ) ) );

	/* requestArray -> Contains all necessary fields for processing in next steps
		name -> name of the request (req1)
		url -> complete url of the request (/page?uri=/k-billa-ramesh/en-kanmani)
		api -> api to hit (/page)
		isSupported -> Implemented in ecs or not
		isAuthRequired -> no need to explain
	*/
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

	// Only on gamma and prod environments
	if( forwardAllToGAE && ( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) ) {

		request.pipe( requestModule( "https://api.pratilipi.com" + request.url ) )
			.on( 'error', function(error) {
				response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'There was an error forwarding the request!' );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.pipe( response )
			.on( 'error', function(error) {
				response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'There was an error forwarding the response!' );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;

	// Devo environment
	} else if( process.env.STAGE === 'devo' && ! isAllSupported ) {
		response.send( "Api Not supported yet!" );

	// Sequential or batch calls
	} else {

		var isParallel = true;
		for( var i = 0; i < requestArray.length; i++ ) {
			if( requestArray[i]["url"].indexOf("$") !== -1 ) {
				isParallel = false;
				break;
			}
		}

		if( isParallel ) {

			var promiseArray = [];
			requestArray.forEach( (req) => {
				var url = req.isSupported
					? 'http://' + process.env.API_END_POINT + routeConfig[req.api].GET.path + ( req.url.split('?')[1] ? ( '?' + req.url.split('?')[1] ) : '' )
					: 'http://api.pratilipi.com' + req.url;
				promiseArray.push( _apiGET( url, request, response, req.isAuthRequired ) );
			});

			// TODO: Minor optimisation for Auth
			// Pretty simple with Promise.all, isn't it?
			Promise.all( promiseArray )
				.then( (responseArray) => { // responseArray will be in order
					var returnResponse = {}; // To be sent to client
					for( var i = 0; i < responseArray.length; i++ )
						returnResponse[ requestArray[i].name ] = responseArray[i].body;
					response.send( JSON.stringify( returnResponse ) );
					request.log.submit( 200, JSON.stringify( returnResponse ).length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				}).catch( (error) => {
					response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'Some exception occurred at the server! Please try again!' );
					request.log.error( JSON.stringify( error ) );
					request.log.submit( error.statusCode, JSON.stringify( error.message ).length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				})
			;
		} else {

			/*
				Approach:
				1. GET the first call
				2. Replace other GET calls with the data
				3. GET the next call
				4. Repeat
			*/
			var responseObject = {}; // To be sent to Client

			function recursiveGET( reqArray ) {

				if( reqArray.length === 0 )
					return new Promise( function( resolve, reject ) { resolve( responseObject ) } );

				// Current request Object
				var req = reqArray[0];
				var url = req.isSupported
					? 'http://' + process.env.API_END_POINT + routeConfig[req.api].GET.path + ( req.url.split('?')[1] ? ( '?' + req.url.split('?')[1] ) : '' )
					: 'http://api.pratilipi.com' + req.url;

				return _apiGET( url, request, response, req.isAuthRequired )
					.then( (res) => {
						var responseJson = JSON.parse( res.body );
						// Modifying other requests of the reqArray
						reqArray.forEach( (aReq) => {
							for( var key in responseJson ) {
								var find = "$" + req.name + "." + key;
								if( aReq.url.indexOf( find ) !== -1 ) {
									aReq.url = aReq.url.replace( find, responseJson[key] );
								}
							}
						});
						// Populating the responseObject
						responseObject[ req.name ] = responseJson;
						reqArray.shift();
						return recursiveGET( reqArray );
					})
					.catch( (error) => {
						response.status( _getResponseCode( error.statusCode ) ).send( error.message || 'Some exception occurred at the server! Please try again!' );
						request.log.error( JSON.stringify( error ) );
						request.log.submit( error.statusCode, JSON.stringify( error.message ).length );
						latencyMetric.write( Date.now() - request.startTimestamp );
					})
				;
			}

			recursiveGET( JSON.parse( JSON.stringify( requestArray ) ) ) // Cloning requestArray
				.then( (res) => {
					response.send( res );
					request.log.submit( 200, JSON.stringify( res ).length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				})
				.catch( (err) => {
					response.status( _getResponseCode( err.statusCode ) ).send( err.error );
					request.log.error( JSON.stringify( err.error ) );
					request.log.submit( err.statusCode || 500, err.error.length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				})
			;
		}
	}
}

function resolvePOST( request, response ) {

	/*
	Decide which method to call internally depending on the required fields provided from the config
	Approach
	1.	check if api is supported
	2.	if apiSupported
		a.	check if auth is required
		b.	check if pipe is required
		c. 	get all the methods supported
		d.	get which method to call using the requiredField provided
		e.	send request to that method depending on the method selected
	*/
	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].POST;
	if( isApiSupported ) {
		var isAuthRequired = isApiSupported && routeConfig[api].POST.auth;
		var isPipeRequired = isApiSupported && routeConfig[api].POST.shouldPipe;
		var listMethods = isApiSupported && routeConfig[api].POST.methods;
		var method = Object.keys(listMethods);
		var methodName;
		var fieldsFlag = 1;
		loop1 :
			for( var i = 0; i < method.length; i++ ) {
				methodName = method[ i ];
				var requiredFields = listMethods[ methodName ];
				fieldsFlag = 1;
				loop2:
					for( var j = 0; j < requiredFields.length; j++ ) {
						var fieldObject = requiredFields[ j ];
						var fieldName = Object.keys( fieldObject );
						var fieldValue = fieldObject[ fieldName ];
						if( _.has( request.body, fieldName ) ) {
							if( fieldValue === null ) {
								continue loop2;
							} else if( fieldValue !== request.body[fieldName] ) {
								console.log('rejecting '+methodName);
								fieldsFlag = 0;
								continue loop1;
							}
						} else {
							console.log('rejecting '+methodName);
							fieldsFlag = 0;
							continue loop1;
						}
				}
				if( fieldsFlag ) {
					console.log('method decided is '+methodName);
					break loop1;
				} else {
					console.log('method not decided');
				}
		}
		if(fieldsFlag) {
			console.log('got the method '+methodName);
			var uri = 'http://' + process.env.API_END_POINT + routeConfig[api].POST.path + ( request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '' );
			console.log('sending request to _apiPOST');
			_apiPOST( uri, request, response, isAuthRequired, methodName )
				.then( (serviceResponse) => {
					// TODO: Check addRespectiveServiceHeaders
					addRespectiveServiceHeaders( response, serviceResponse.headers );
					response.status( serviceResponse.statusCode ).send( serviceResponse.body );
					request.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				})
				.catch( (err) => {
					response.status( _getResponseCode( err.statusCode ) ).send( err.error );
					request.log.error( JSON.stringify( err.error ) );
					request.log.submit( err.statusCode || 500, err.error.length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				})
			;

		} else {
			console.log('all methods rejected');
			response.send( "Wrong arguments" );
		}
	} else {
		response.send( "Api Not supported yet!" );
	}
}



const app = express();

app.use( morgan('short') );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
