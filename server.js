var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );
var requestModule = require( 'request' );
var Promise = require( 'bluebird' );
var express = require( 'express' );
var _ = require( 'lodash' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );

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

const APPENGINE_ENDPOINT =
	( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) ?
	"https://api.pratilipi.com" :
	"https://devo-pratilipi.appspot.com";

const ECS_END_POINT = process.env.API_END_POINT.indexOf( "http" ) === 0 ? process.env.API_END_POINT : ( "http://" + process.env.API_END_POINT );

function _isEmpty( obj ) {
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
		if( keyValue[1] != null )
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

	console.log( "_forwardToGae" ); // TODO: Remove
	var appengineUrl = APPENGINE_ENDPOINT + request.url;
	appengineUrl += ( appengineUrl.indexOf( "?" ) === -1 ? "?" : "&" ) + "accessToken=" + response.locals[ "access-token" ];
	console.log( "appengineUrl = " + appengineUrl ); // TODO: Remove

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
	console.log( "_getHttpPromise" );
	console.log( "uri = " + uri );
	console.log( "method = " + method );
	console.log( "headers = " + JSON.stringify( headers ) );
	console.log( "body = " + JSON.stringify( body ) );
	var genericReqOptions = {
		uri: uri,
		method: method,
		agent : uri.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		json: true,
		resolveWithFullResponse: true
	};
	if( headers ) genericReqOptions.headers = headers;
	if( body ) genericReqOptions.body = body;
	console.log( 'HTTP_CALL :: ' + method + " :: " + uri );
	return httpPromise( genericReqOptions );
}


function _getAuth( resource, method, primaryContentId, params, request, response ) {

	console.log( "_getAuth" ); // TODO: Remove

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

	console.log( "authParams = " + JSON.stringify( authParams ) ); // TODO: Remove
	console.log( 'Sending authentication request...' );

	var authEndpoint = ECS_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT + "?" + _formatParams( authParams );
	var headers = { 'Access-Token': response.locals[ "access-token" ] };

	console.log( "headers = " + JSON.stringify( headers ) ); // TODO: Remove

	return _getHttpPromise( authEndpoint, "GET", headers )
		.then( authResponse => {
			console.log( "authResponse.body = " + JSON.stringify( authResponse.body ) ); // TODO: Remove
			var isAuthorized = authResponse.body.data[0].isAuthorized;
			console.log( "isAuthorized = " + isAuthorized ); // TODO: Remove
			var statusCode = authResponse.body.data[0].code;
			console.log( "statusCode = " + statusCode ); // TODO: Remove
			if( ! isAuthorized ) {
				response.status( _getResponseCode( statusCode ) ).send( INSUFFICIENT_ACCESS_EXCEPTION );
				console.log( 'AUTHENTICATION_FAILED' );
				request.log.submit( statusCode, "AUTHENTICATION_FAILED" );
				latencyMetric.write( Date.now() - request.startTimestamp );
				return;
			} else {
				console.log( 'AUTHENTICATION_SUCCESSFUL' );
				console.log( "auth response headers = " + JSON.stringify( authResponse.headers ) ); // TODO: Remove
				return authResponse.headers[ 'user-id' ];
			}
		 })
		.catch( (authError) => {
			console.log( authError.message );
			response.status( _getResponseCode( authError.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
			request.log.submit( 500, "AUTHENTICATION_CALL_FAILED" );
			latencyMetric.write( Date.now() - request.startTimestamp );
		})
	;

}


/*
	_getService() -> Generic function returning a httpPromise
	requestUrl is used for GET Batch calls,
	if requestUrl == null, fallback to request.url
*/

function _getService( method, requestUrl, request, response ) {

	console.log( "_getService" ); // TODO: Remove
	if( requestUrl == null )
		requestUrl = request.url.substr(4);

	console.log( "requestUrl = " + requestUrl ); // TODO: Remove

	var api = requestUrl.split( "?" )[0];
	console.log( "api = " + api ); // TODO: Remove
	var urlQueryParams = _getUrlParameters( requestUrl );
	console.log( "urlQueryParams = " + JSON.stringify( urlQueryParams ) ); // TODO: Remove

	var isGETRequest = method === "GET";
	console.log( "isGETRequest = " + isGETRequest ); // TODO: Remove
	var servicePath = isGETRequest ? routeConfig[api]["GET"]["path"] : routeConfig[api]["POST"]["path"];
	console.log( "servicePath = " + servicePath ); // TODO: Remove

	var primaryKey = isGETRequest
		? routeConfig[api]["GET"].primaryKey
		: routeConfig[api]["POST"]["methods"][method].primaryKey;
	console.log( "primaryKey = " + primaryKey ); // TODO: Remove

	var params = isGETRequest ? urlQueryParams : request.body;
	console.log( "params = " + JSON.stringify( params ) ); // TODO: Remove
	var primaryContentId = params[ primaryKey ] ? params[ primaryKey ] : null;
	console.log( "primaryContentId = " + primaryContentId ); // TODO: Remove

	// headers
	var headers = { 'Access-Token': response.locals[ "access-token" ] };
	headers[ "AccessToken" ] = response.locals[ "access-token" ]; // TODO: Remove it once changes are made in Recommendation
	if( request.headers.version )
		headers[ "Version" ] = request.headers.version;
	console.log( "headers = " + JSON.stringify( headers ) ); // TODO: Remove
	// body
	var body = ( ( method === "POST" || method === "PATCH" ) && request.body ) ? request.body : null;
	console.log( "body = " + JSON.stringify( body ) ); // TODO: Remove

	var isAuthRequired = isGETRequest ? routeConfig[api]["GET"].auth : true; // true for all non-GET requests
	console.log( "isAuthRequired = " + isAuthRequired ); // TODO: Remove

	var serviceUrl = ECS_END_POINT + servicePath;
    	if( primaryContentId ) serviceUrl += "/" + primaryContentId; // RESTful
    	if( ! _isEmpty( urlQueryParams ) ) serviceUrl += '?' + _formatParams( urlQueryParams );
    	console.log( "serviceUrl = " + serviceUrl ); // TODO: Remove

	var authPromise = isAuthRequired
		? _getAuth( servicePath, method, primaryContentId, params, request, response )
		: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	return authPromise
		.then( (userId) => {
			if( userId !== -1 ) headers[ "User-Id" ] = userId;
			console.log( "headers = " + JSON.stringify( headers ) ); // TODO: Remove
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

	console.log( "resolveGET" ); // TODO: Remove
	// request.path will be /api/xxx
	var api = request.path.substr(4);
	console.log( "api = " + api ); // TODO: Remove
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	console.log( "isApiSupported = " + isApiSupported ); // TODO: Remove
	var isPipeRequired = isApiSupported && routeConfig[api].GET.shouldPipe;
	console.log( "isPipeRequired = " + isPipeRequired ); // TODO: Remove

	// For image requests
	if( isPipeRequired ) {
		console.log( "isPipeRequired block" ); // TODO: Remove
		var isAuthRequired = routeConfig[api].GET.auth;
		console.log( "isAuthRequired = " + isAuthRequired ); // TODO: Remove
		var resource = encodeURIComponent( routeConfig[api].GET.path );
		console.log( "resource = " + resource ); // TODO: Remove
		var primaryContentId = _getUrlParameter( request.url, routeConfig[api].GET.primaryKey );
		console.log( "primaryContentId = " + primaryContentId ); // TODO: Remove

		var authPromise = isAuthRequired
			? _getAuth( resource, "GET", primaryContentId, null, request, response )
			: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

		var url = ECS_END_POINT + routeConfig[api].GET.path + ( request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : '' );
		console.log( "url = " + url ); // TODO: Remove

		authPromise
			.then( (userId) => {
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
			});

	// Supported in ecs
	} else if( isApiSupported ) {
		console.log( "isApiSupported block" ); // TODO: Remove
		_getService( "GET", null, request, response )
			.then( (serviceResponse) => {
				console.log( "Got ServiceResponse" ); // TODO: Remove
				console.log( "serviceResponse.headers = " + JSON.stringify( serviceResponse.headers ) ); // TODO: Remove
				_addRespectiveServiceHeaders( response, serviceResponse.headers );
				console.log( "serviceResponse.statusCode = " + serviceResponse.statusCode ); // TODO: Remove
				console.log( "serviceResponse.body = " + JSON.stringify( serviceResponse.body ) ); // TODO: Remove
				response.status( _getResponseCode( serviceResponse.statusCode ) ).send( serviceResponse.body );
				request.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
			.catch( (err) => {
				console.log( "Error ServiceResponse" ); // TODO: Remove
				console.log( "err.statusCode = " + err.statusCode ); // TODO: Remove
				console.log( "err.message = " + err.message ); // TODO: Remove
				response.status( _getResponseCode( err.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
				request.log.error( JSON.stringify( err.message ) );
				request.log.submit( err.statusCode || 500, err.message.length );
				latencyMetric.write( Date.now() - request.startTimestamp );
			})
		;

	// Forward to appengine
	} else {
		_forwardToGae( "GET", request, response );
	}

}

function resolveGETBatch( request, response ) {

	/*
		Sample batch call request:
		/api?requests={"req1":"/page?uri=/k-billa-ramesh/en-kanmani","req2":"/pratilipi?_apiVer=2&pratilipiId=$req1.primaryContentId"}

		Cases - Environment:
		1. If all requests are not supported -> Forward Request to appengine

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


	if( forwardAllToGAE ) {
		_forwardToGae( "GET", request, response );

	} else { // Sequential or batch calls

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
					var uri = APPENGINE_ENDPOINT + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + response.locals[ "access-token" ];
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
					var appengineUrl = APPENGINE_ENDPOINT + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + response.locals[ "access-token" ];
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
			var resource = encodeURIComponent( routeConfig[api].POST.path );
			var primaryContentId = _getUrlParameter( request.url, routeConfig[api].POST.primaryKey );
			_getAuth( resource, "POST", primaryContentId, null, request, response )
				.then( (userId) => {
					request.pipe( requestModule.post( ECS_END_POINT + request.url, request.body ) )
						.on( 'error', (error) => {
							console.log( JSON.stringify(error) );
							response.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
						})
						.pipe( response )
						.on( 'error', function(error) {
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
				_resolvePostPatchDelete( methodName, request, response );
			} else {
				response.send( "Method not yet supported!" );
			}
		}

	// Forward to appengine
	} else {
		_forwardToGae( "POST", request, response );
	}

}

function _resolvePostPatchDelete( methodName, request, response ) {

	// Sanity check -> direct request from frontend
	var api = request.path.substr(4);
	var isApiSupported = routeConfig[api] && routeConfig[api]["POST"][methodName];

	if( isApiSupported ) {
		_getService( methodName, null, request, response )
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
		response.send( "Api Not supported yet!" );
	}
}

const app = express();

app.use( morgan('short') );
app.use( cookieParser() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );

// for initializing log object
app.use( (request, response, next) => {
	var log = request.log = new Logging( request );
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

// Setting access-token in response.locals
app.use( (request, response, next) => {

	var accessToken = null;
	if( request.headers.accesstoken )
		accessToken = request.headers.accesstoken;
	else if( request.cookies[ "access_token" ] )
		accessToken = request.cookies[ "access_token" ];
	else if( _getUrlParameter( request.url, "accessToken" ) )
		accessToken = _getUrlParameter( request.url, "accessToken" );

	if( accessToken ) {
		response.locals[ "access-token" ] = accessToken;
		next();
	} else {
		response.status( 400 ).send( "AccessToken is missing in header!" );
	}

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
	// TODO: Uncomment once Frontend makes all calls
	// _resolvePostPatchDelete( "PATCH", request, response );
});

/*
// patch
app.patch( ['/*'], (request, response, next) => {
	_resolvePostPatchDelete( "PATCH", request, response );
});

// delete
app.delete( ['/*'], (request, response, next) => {
	_resolvePostPatchDelete( "DELETE", request, response );
});
*/

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
