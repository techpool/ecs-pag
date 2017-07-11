var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );
var requestModule = require( 'request' );
var Promise = require( 'bluebird' );
var express = require( 'express' );
var _ = require( 'lodash' );
var bodyParser = require('body-parser');

var httpAgent = new http.Agent({ keepAlive : true });
var httpsAgent = new https.Agent({ keepAlive : true });

const morgan = require( 'morgan' );
const mainConfig = require( './config/main' )[ process.env.STAGE ];
const routeConfig = require( './config/route' );
const authConfig = require( './config/auth' );

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

function isEmpty( obj ) {
	for( var prop in obj ) {
		if( obj.hasOwnProperty( prop ) )
			return false;
	}
	return JSON.stringify( obj ) === JSON.stringify( {} );
}

function _formatParams( params ) {
	if( params == null ) return "";
	if( typeof( params ) === "string" ) return params;
	return Object.keys( params ).map( function(key) { return key + "=" + params[key] }).join("&");
};

function _getUrlParameters( url ) {
	if( url.indexOf( "?" ) !== -1 ) url = url.split( "?" )[1];
	var params = {};
	var vars = url.split( "&" );
	for( var i = 0; i < vars.length; i++ ) {
		var keyValue = vars[i].split( "=" );
		params[ keyValue[0] ] = keyValue[1];
	}
	return params;
}

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

function _getResponseCode( code ) { // TODO: Track service -> Logging purpose

	if( ! code ) {
		console.log( "MISSING_RESPONSE_CODE" );
		return 500;
	}

	code = parseInt( code );

	Array.prototype.contains = function(obj) {
		return this.indexOf(obj) > -1;
	};

	// supportedCodesOnPag = [200, 207, 400, 401, 403, 404, 500, 502, 504];
	var supportedCodesOnFrontend = [ 200, 400, 401, 404, 500 ];
	if( supportedCodesOnFrontend.contains( code ) )
		return code;
	else if( code === 207 )
		return 200;
	else if( code === 403 || code === 404 )
		return 401;
	else if( code === 502 || code === 504 )
		return 500;

	console.log( "INVALID_RESPONSE_CODE::" + code );

	if( code >= 200 && code < 300 )
		return 200;
	else if( code >= 400 && code < 500 )
		return 400;
	else
		return 500;

}

function _forwardToGae( method, request, response ) {

	var appengineUrl = "https://api.pratilipi.com" + request.url;
	appengineUrl += ( appengineUrl.indexOf( "?" ) === -1 ? "?" : "&" ) + "accessToken=" + request.headers.accesstoken;

	request.pipe( method === "GET" ? requestModule( appengineUrl ) : requestModule.post( appengineUrl, request.body ) )
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
}

function _getHttpPromise( uri, method, headers, body ) {
	var genericReqOptions = {
		uri: uri,
		method: method,
		agent : uri.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		json: true,
		resolveWithFullResponse: true
	};
	if( headers ) genericReqOptions.headers = headers;
	if( body ) genericReqOptions.body = body;
	console.log( 'HTTP_CALL:' + uri );
	return httpPromise( genericReqOptions );
}


function _getAuth( resource, method, primaryContentId, params, request, response ) {

	// Bad Request
	if( ! request.headers.accesstoken ) {
		response.status( 400 ).send( "AccessToken is missing in header!" );
		return;
	}

	var authParams = {
		'resource': encodeURIComponent( resource ),
		'method': method
	};

	if( primaryContentId ) authParams.id = primaryContentId;

	var paramsWhiteList = authConfig[ resource ][ method ][ "params" ];
	for( var i = 0; i < paramsWhiteList.length; i++ ) {
		var key = paramsWhiteList[i];
		if( params && params[key] && ! authParams[key] )
			authParams[key] = params[key];
	}

	request.log.info( 'Sending authentication request...' );

	// Services that needed Auth -> Considering it to be in application/json format
	response.setHeader( 'Content-Type','application/json' );

	var authEndpoint = process.env.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT + "?" + _formatParams( authParams );
	var headers = { 'Access-Token': request.headers.accesstoken };

	return _getHttpPromise( authEndpoint, "GET", headers )
		.then( authResponse => {
			var isAuthorized = authResponse.body.data[0].isAuthorized;
			var statusCode = authResponse.body.data[0].code;
			if( ! isAuthorized ) {
				response.status( _getResponseCode( statusCode ) ).send( INSUFFICIENT_ACCESS_EXCEPTION );
				request.log.submit( statusCode, "AUTHENTICATION_FAILED" );
				latencyMetric.write( Date.now() - request.startTimestamp );
				return;
			} else {
				request.log.info( 'AUTHENTICATION_SUCCESSFUL' );
				return authResponse.headers[ 'user-id' ];
			}
		 })
		.catch( (authError) => {
			response.status( _getResponseCode( authError.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
			request.log.submit( 500, "AUTHENTICATION_CALL_FAILED" );
			latencyMetric.write( Date.now() - request.startTimestamp );
		})
	;

}


/*
	_getService() -> Generic function returning a httpPromise
	requestUrl is used for GET Batch calls,
	if requestUrl == null, consider from request.url
*/

function _getService( method, requestUrl, request, response ) {

	var api = requestUrl != null
		? requestUrl.split( "?" )[0]
		: request.path.substr(4);

	var urlQueryParams = _getUrlParameters( requestUrl ? requestUrl : request.url );

	var isGETRequest = method === "GET";
	var servicePath = isGETRequest ? routeConfig[api]["GET"]["path"] : routeConfig[api]["POST"]["path"];

	var primaryKey = isGETRequest
		? routeConfig[api]["GET"].primaryKey
		: routeConfig[api]["POST"]["methods"][method].primaryKey;

	var params = isGETRequest ? urlQueryParams : request.body;
	var primaryContentId = params[ primaryKey ] ? params[ primaryKey ] : null;

	// headers
	var headers = { 'Access-Token': request.headers.accesstoken };
	headers[ "AccessToken" ] = request.headers.accesstoken; // TODO: Remove it once changes are made in Recommendation
	if( request.headers.version )
		headers[ "Version" ] = request.headers.version;

	// body
	var body = ( ( method === "POST" || method === "PATCH" ) && request.body ) ? request.body : null;

	var isAuthRequired = isGETRequest ? routeConfig[api]["GET"].auth : true; // true for all non-GET requests

	var authPromise = isAuthRequired
		? _getAuth( servicePath, method, primaryContentId, params, request, response )
		: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	var serviceUrl = process.env.API_END_POINT + servicePath;
	if( primaryKey ) serviceUrl += "/" + primaryKey; // RESTful
	serviceUrl += ( isEmpty( urlQueryParams ) ? '' : ( '?' + _formatParams( urlQueryParams ) ) );

	return authPromise
		.then( (userId) => {
			if( userId !== -1 ) headers[ "User-Id" ] = userId;
			return _getHttpPromise( serviceUrl, method, headers, body );
		})
	;

}

function resolveGET( request, response ) {

	/*
	*	3 cases:
	*	1. images -> With or without authentication
	*	2. not supported in ecs && ( gamma || prod ) -> Forward request to Appengine
	*	3. not supported in ecs && devo environment -> Send 'not supported'
	*/

	// request.path will be /api/xxx
	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	var isPipeRequired = isApiSupported && routeConfig[api].GET.shouldPipe;

	// For image requests
	if( isPipeRequired ) {
		// TODO: isAuthRequired for images (Content images)
		var url = process.env.API_END_POINT + routeConfig[api].GET.path + ( request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : '' );
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
		_getService( "GET", null, request, response )
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
		_forwardToGae( "GET", request, response );

	// not supported on devo environment
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
		_forwardToGae( "GET", request, response );

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
				var url;
				if( req.isSupported ) {
					promiseArray.push( _getService( "GET", req.url, request, response ) );
				} else {
					var uri = 'https://api.pratilipi.com' + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + request.headers.accesstoken;
					promiseArray.push( _getHttpPromise( uri, "GET" ) );
				}
			});

			// Pretty simple with Promise.all, isn't it?
			Promise.all( promiseArray )
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
				var promise;
				if( req.isSupported ) {
					promise = _getService( "GET", req.url, request, response );
				} else {
					var appengineUrl = 'https://api.pratilipi.com' + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + request.headers.accesstoken;
					promise = _getHttpPromise( appengineUrl, "GET" );
				}

				return promise
					.then( (res) => {
						var responseJson = res.body;
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
						request.log.submit( error.statusCode, error.message );
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

function resolvePOST( request, response ) {

	/*
	Decide which method to call internally depending on the required fields provided from the config
	Approach
	1.	check if api is supported
	2.	if apiSupported
		a. 	get all the methods supported
		b.	get which method to call using the requiredField provided
		c.	send request to that method depending on the method selected
	3. pipe is required for image requests
	*/

	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api].POST;
	if( isApiSupported ) {
		var isPipeRequired = routeConfig[api].POST.shouldPipe;
		if( isPipeRequired ) {
			_getAuth( servicePath, method, primaryContentId, params, request, response )
				.then( (userId) => {
					req.pipe( requestModule.post( process.env.API_END_POINT + req.url, req.body ) )
						.on( 'error', (error) => {
							console.log( JSON.stringify(error) );
							response.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
						})
						.pipe( res )
						.on( 'error', function(error){
							console.log( JSON.stringify(error) );
							response.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
						})
					;
				})
			;

		} else {
			var listMethods = routeConfig[api].POST.methods;
			var methods = Object.keys( listMethods );
			var methodName;
			var fieldsFlag;
			loop1 :
				for( var i = 0; i < methods.length; i++ ) {
					methodName = methods[i];
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

			if( fieldsFlag ) {
				_getService( methodName, request, response )
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
			} else {
				response.send( "Method not yet supported!" );
			}
		}

	// Forward to appengine -> Supported only on gamma and prod
	} else if( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) {
		_forwardToGae( "POST", request, response );

	// not supported on devo environment
	} else {
		response.send( "Api Not supported yet!" );
	}

}

function _resolvePostPatchDelete( methodName, request, response ) {
	// TODO: Implementation
}

const app = express();

app.use( morgan('short') );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );
// for initializing log object


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

app.listen(8080);
