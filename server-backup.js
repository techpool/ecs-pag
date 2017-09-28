var http = require( 'http' );
var https = require( 'https' );
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

const INVALID_ARGUMENT_EXCEPTION = { "message": "Invalid Arguments." };
const INSUFFICIENT_ACCESS_EXCEPTION = { "message": "Insufficient privilege for this action." };
const UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

var httpAgent = new http.Agent({ keepAlive : true });
var httpsAgent = new https.Agent({ keepAlive : true });


function _getUrlParameter( url, parameter ) {
	if( url.indexOf( "?" ) !== -1 ) url = url.split( "?" )[1];
	var vars = url.split( "&" );
	for( var i = 0; i < vars.length; i++ ) {
		var pair = vars[i].split( "=" );
		if( pair[0] == parameter ) {
			return pair[1];
		}
	}
	return null;
}

function _addRespectiveServiceHeaders( response, serviceReturnedHeaders ) {
	var pagHeaders = [ 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers' ];
	var serviceHeaders = _.omit( serviceReturnedHeaders, pagHeaders );
	response.set( serviceHeaders );
}

function _getResponseCode( code ) {

	if( ! code ) {
		console.log( "Response code is not properly sent!" );
		return 500;
	}

	code = parseInt( code );

	Array.prototype.contains = function(obj) {
		return this.indexOf(obj) > -1;
	};

	var supportedCodesOnFrontend = [ 200, 400, 401, 404, 500 ]; // supportedCodesOnPag = [200, 207, 400, 401, 403, 404, 500, 502, 504];
	if( supportedCodesOnFrontend.contains( code ) )
		return code;
	else if( code === 207 )
		return 200;
	else if( code === 403 )
		return 401;
	else if( code === 502 || code === 504 )
		return 500;

	console.log( "Invalid Response Code sent: " + code );
	return 500;

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
		uri: process.env.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT,
		agent : httpAgent,
		headers: { 'AccessToken': request.headers.accesstoken },
		resolveWithFullResponse: true
	};

	return httpPromise( authOptions )
		.then( authResponse => {
			request.log.info( 'Authenticated !' );
			response.locals[ 'user-id' ] = authResponse.headers[ 'user-id' ];
			return response.locals[ 'user-id' ];
		 })
		.catch( (authError) => {
			request.log.info( "Authentication Failed! Message Printed Below:" );
			request.log.info( JSON.stringify( authError.error ) );
			request.log.submit( authError.statusCode || 500, authError.error.length );
			latencyMetric.write( Date.now() - request.startTimestamp );
			response.status( _getResponseCode( authError.statusCode ) ).send( { "message": authError.error } );
		})
	;

}

function _getHttpPromise( uri, method, isAuthRequired, request, response ) {

	var authPromise = isAuthRequired
			? _getUserAuth( request, response )
			: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	var genericReqOptions = {
		uri: uri,
		method: method,
		agent : uri.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		json: true,
		headers: {},
		resolveWithFullResponse: true
	};

	if( ( method === "POST" || method === "PATCH" ) && request.body )
		genericReqOptions[ "body" ] = request.body;

	if( request.headers.version )
		genericReqOptions.headers[ "Version" ] = request.headers.version;

	return authPromise
			.then( userId => {
				if( userId != -1 ) {
					genericReqOptions.headers[ "User-Id" ] = userId;
					genericReqOptions.headers[ "AccessToken" ] = request.headers.accesstoken; // TODO: Remove it once changes are made in Recommendation
					genericReqOptions.headers[ "Access-Token" ] = request.headers.accesstoken;
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
	*   2. ecs -> with auth (other services) (images also)
	*   3. not supported in ecs && devo environment -> Send 'not supported'
	*   4. not supported in ecs && ( gamma || prod ) -> Forward request to Appengine
	*/

	// request.path will be /api/xxx
	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	var isAuthRequired = isApiSupported && routeConfig[api].GET.auth;
	var isPipeRequired = isApiSupported && routeConfig[api].GET.shouldPipe;

	// For image requests
	if( isPipeRequired ) {
		// TODO: isAuthRequired for images? (Content images)
		var urlSuffix = request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : '';
		var uriNew = routeConfig[api].GET.path + urlSuffix;
		var url = process.env.API_END_POINT + uriNew;
		request.pipe( requestModule( url ) )
			.on( 'error', function( error ) {
				response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the request!' );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.pipe( response )
			.on( 'error', function( error ) {
				response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the response!' );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;
	// Supported in ecs
	} else if( isApiSupported ) {
		var uri = process.env.API_END_POINT + routeConfig[api].GET.path;
		var primaryKey = _getUrlParameter( request.url, routeConfig[api].GET.primaryKey );
		if( primaryKey ) uri += "/" + primaryKey;
		uri += ( request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '' );
		request.log.info( "Forwarding request to : " + uri );
		_getHttpPromise( uri, "GET", isAuthRequired, request, response )
			.then( (serviceResponse) => {
				_addRespectiveServiceHeaders( response, serviceResponse.headers );
				response.status( _getResponseCode( serviceResponse.statusCode ) ).send( serviceResponse.body );
				request.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.catch( (err) => {
				response.status( _getResponseCode( err.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( err.message ) );
				request.log.submit( err.statusCode || 500, err.message.length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;

	// Forward to appengine -> Supported only on gamma and prod
	} else if( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) {
		var appengineUrl = "https://api.pratilipi.com" + request.url;
		appengineUrl += ( appengineUrl.indexOf( "?" ) === -1 ? "?" : "&" ) + "accessToken=" + request.headers.accesstoken;
		request.pipe( requestModule( appengineUrl ) )
			.on( 'error', (error) => {
				response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the request!' );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.pipe( response )
			.on( 'error', (error) => {
				response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the response!' );
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

		var appengineUrl = "https://api.pratilipi.com?accessToken=" + request.headers.accesstoken + "&requests=" + encodeURIComponent( JSON.stringify( requests ) );
		request.pipe( requestModule( appengineUrl ) )
			.on( 'error', function(error) {
				response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the request!' );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.pipe( response )
			.on( 'error', function(error) {
				response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( error ) );
				request.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the response!' );
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

			var authRequired = false;
			for( var i = 0; i < requestArray.length; i++ ) {
				if( requestArray[i][ "isAuthRequired" ] ) {
					authRequired = true;
					break;
				}
			}

			var authPromise = authRequired
				? _getUserAuth( request, response )
				: new Promise( function( resolve, reject ) { resolve(-1); });

			authPromise
				.then( (auth) => { // Hack -> Calling Auth service only once
					var promiseArray = [];
					requestArray.forEach( (req) => {
						var url;
						if( req.isSupported ) {
							url = process.env.API_END_POINT + routeConfig[req.api].GET.path;
							var primaryKey = _getUrlParameter( req.url, routeConfig[req.api].GET.primaryKey );
							if( primaryKey ) url += "/" + primaryKey;
							url += ( req.url.split('?')[1] ? ( '?' + req.url.split('?')[1] ) : '' );
						} else {
							url = 'https://api.pratilipi.com' + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + request.headers.accesstoken;
						}
						promiseArray.push( _getHttpPromise( url, "GET", req.isAuthRequired, request, response ) );
					});
					return Promise.all( promiseArray ); // Pretty simple with Promise.all, isn't it?
				})
				.then( (responseArray) => { // responseArray will be in order
					var returnResponse = {}; // To be sent to client
					for( var i = 0; i < responseArray.length; i++ )
						returnResponse[ requestArray[i].name ] = responseArray[i].body;
					response.send( returnResponse );
					request.log.submit( 200, JSON.stringify( returnResponse ).length );
					latencyMetric.write( Date.now() - request.startTimestamp );
				}).catch( (error) => {
					response.status(500).send( UNEXPECTED_SERVER_EXCEPTION );
					request.log.error( error.statusCode ); // 'Bad Request'
					request.log.error( error.message ); // Html
					request.log.submit( 500, error.message.length );
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
				var url;
				if( req.isSupported ) {
					url = process.env.API_END_POINT + routeConfig[req.api].GET.path;
					var primaryKey = _getUrlParameter( req.url, routeConfig[req.api].GET.primaryKey );
					if( primaryKey ) url += "/" + primaryKey;
					url += ( req.url.split('?')[1] ? ( '?' + req.url.split('?')[1] ) : '' );
				} else {
					url = 'https://api.pratilipi.com' + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + request.headers.accesstoken;
				}

				return _getHttpPromise( url, "GET", req.isAuthRequired, request, response )
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
						responseObject[ req.name ] = responseJson; // Populating the responseObject
						reqArray.shift();
						return recursiveGET( reqArray );
					})
					.catch( (error) => {
						response.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
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
			;
		}
	}
}

function _resolvePostPatchDelete( methodName, request, response ) {

	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].POST[ "methods" ][ methodName ];

	if( isApiSupported ) {
		var uri;
		if( methodName === "POST" ) {
			uri = process.env.API_END_POINT + routeConfig[api].POST.path + ( request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '' );
		} else if( methodName === "PATCH" || methodName === "DELETE" ) {
			uri = process.env.API_END_POINT + routeConfig[api].POST.path
				+ "/" + routeConfig[api][ "POST" ][ "methods" ][ methodName ][ "primaryKey" ];
				+ ( request.url.split('?')[1] ? ( '?' + request.url.split('?')[1] ) : '' );
		}

		// Assumption: isAuthRequired = true for all POST requests
		_getHttpPromise( uri, methodName, true, request, response )
			.then( (serviceResponse) => {
				_addRespectiveServiceHeaders( response, serviceResponse.headers );
				response.status( serviceResponse.statusCode ).send( serviceResponse.body );
				request.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.catch( (err) => {
				response.status( _getResponseCode( err.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( err.message ) );
				request.log.submit( err.statusCode || 500, err.message.length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;
	} else {
		response.send( "Method not yet supported!" );
	}
}

function resolvePOST( request, response ) {

	/*
	Decide which method to call internally depending on the required fields provided from the config
	Approach
	1.	check if api is supported
	2.	if apiSupported
		a. 	get all the methods supported
		b.	get which method to call using the requiredField provided
		c.	send request to that method depending on the method selected
	*/

	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].POST;
	if( isApiSupported ) {
		var isPipeRequired = routeConfig[api].POST.shouldPipe;
		if( isPipeRequired ) {
			var url = process.env.API_END_POINT + req.url;
			req.pipe( requestModule.post( url, req.body ) )
				.on( 'error', (error) => {
					console.log( JSON.stringify(error) );
					response.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
			})
			.pipe( res )
			.on( 'error', function(error){
				console.log( JSON.stringify(error) );
				response.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
			});
		} else {
			var listMethods = routeConfig[api].POST.methods;
			var method = Object.keys( listMethods );
			var methodName;
			var fieldsFlag;
			loop1 :
				for( var i = 0; i < method.length; i++ ) {
					methodName = method[i];
					var requiredFields = listMethods[ methodName ][ 'requiredFields' ];
					fieldsFlag = true;
					loop2 :
						for( var j = 0; j < requiredFields.length; j++ ) {
							var fieldObject = requiredFields[ j ];
							var fieldName = Object.keys( fieldObject )[0];
							var fieldValue = fieldObject[ fieldName ];
							if( ! request.body[fieldName] || ( fieldValue !== null && fieldValue !== request.body[fieldName] ) ) {
								fieldsFlag = false;
								continue loop1;
							}
						}
					if( fieldsFlag ) {
						break loop1;
					}
				}

			if( fieldsFlag )
				_resolvePostPatchDelete( methodName, request, response );
			else
				response.send( "Method not yet supported!" );
		}

	// Forward to appengine -> Supported only on gamma and prod
	} else if( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) {
		var appengineUrl = "https://api.pratilipi.com" + request.url;
		appengineUrl += ( appengineUrl.indexOf( "?" ) === -1 ? "?" : "&" ) + "accessToken=" + request.headers.accesstoken;
		var options = {
			method: 'POST',
			uri: appengineUrl,
			form: request.body
		};
		requestModule.post( options, (err, httpResponse, body) => {
			if( err ) {
				response.status( _getResponseCode( httpResponse.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( err ) );
				request.log.submit( httpResponse.statusCode || 500, err.message || 'There was an error forwarding the request to gae!' );
			} else {
				response.status( httpResponse.statusCode ).send( body );
			}
			latencyMetric.write( Date.now() - request.startTimestamp );
		});
	} else {
		response.send( "Api Not supported yet!" );
	}
}



const app = express();

app.use( morgan('short') );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );
// for initializing log object
app.use( (request, response, next) => {
	request.log = new Logging( request );
	request.startTimestamp = Date.now();
	next();
});

//CORS middleware
app.use( (request, response, next) => {
	response.setHeader( 'Access-Control-Allow-Origin', "*" ); //TODO: add only pratilipi origin
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

// patch
app.patch( ['/*'], (request, response, next) => {
	_resolvePostPatchDelete( "PATCH", request, response );
});

// delete
app.delete( ['/*'], (request, response, next) => {
	_resolvePostPatchDelete( "DELETE", request, response );
});

// Debugging
app.use( function (err, req, res, next) {
	console.error( JSON.stringify(err) );
	console.error( err.stack );
	res.status( err.code || 500 ).json( { "error": err.message } );
});

process.on( 'unhandledRejection', function( reason, p ) {
	console.info( "Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason );
});

app.listen(80);
