var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );
var requestModule = require( 'request' );
var Promise = require( 'bluebird' );
var express = require( 'express' );
var _ = require( 'lodash' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );
var urlModule = require( 'url' );
var _normalizeHeaderCase = require( 'header-case-normalizer' ); // https://www.npmjs.com/package/header-case-normalizer

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

const SUCCESS_MESSAGE = { "message": "OK" };
const INVALID_ARGUMENT_EXCEPTION = { "message": "Invalid Arguments." };
const INSUFFICIENT_ACCESS_EXCEPTION = { "message": "Insufficient privilege for this action." };
const UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

const ECS_END_POINT = process.env.API_END_POINT.indexOf( "http" ) === 0 ? process.env.API_END_POINT : ( "http://" + process.env.API_END_POINT );

process.env.UV_THREADPOOL_SIZE = 128;

var _getAppengineEndpoint = function( request ) {
	return ( request.headers.host === "temp.pratilipi.com" || request.headers.host === "android.pratilipi.com" ) ?
		mainConfig.ANDROID_APPENGINE_ENDPOINT : mainConfig.WEB_APPENGINE_ENDPOINT;
};

function _isEmpty( obj ) {
	if( ! obj ) return true;
	for( var prop in obj )
		return false;
	return JSON.stringify( obj ) === JSON.stringify( {} );
}

function _formatParams( params ) {
	if( params == null ) return "";
	if( typeof( params ) === "string" ) return params;
	return Object.keys( params ).map( function(key) { return key + "=" + params[key] }).join("&");
};

function _getUrlParameters( url ) {
	return urlModule.parse( url, true ).query;
}

function _getUrlParameter( url, parameter ) {
	return _getUrlParameters( url )[ parameter ];
}

function _sendResponseToClient( request, response, status, body ) {
	var _getResponseCode = function( status, requestUrl ) {
		if( ! status ) {
			console.log( "MISSING_RESPONSE_CODE :: " + requestUrl );
			return 500;
		}
		status = parseInt( status );
		Array.prototype.contains = function(obj) { return this.indexOf(obj) > -1; };
		// supportedCodesOnPag = [200, 207, 400, 401, 403, 404, 500, 502, 504];
		var supportedCodesOnFrontend = [ 200, 400, 401, 404, 500 ];
		if( supportedCodesOnFrontend.contains( status ) ) return status;
		else if( status === 207 ) return 200;
		else if( status === 403 || status === 404 ) return 401;
		else if( status === 502 || status === 504 ) return 500;
		console.log( "INVALID_RESPONSE_CODE :: " + requestUrl );
		if( status >= 200 && status < 300 ) return 200;
		else if( status >= 400 && status < 500 ) return 400;
		else return 500;
	};
	var _getResponseBody = function( body, status, requestUrl ) {
		var _getStatusCodeMessage = function( status ) {
			// Response depends on status code
            if( status === 200 ) return SUCCESS_MESSAGE;
            else if( status === 400 || status === 404 ) return INVALID_ARGUMENT_EXCEPTION;
            else if( status === 401 ) return INSUFFICIENT_ACCESS_EXCEPTION;
            else return UNEXPECTED_SERVER_EXCEPTION;
		};
		if( body ) {
			if( typeof( body ) === "object" ) return body;
			try {
				return JSON.parse( body );
			} catch(e) {
				return _getStatusCodeMessage( status );
			}
		} else {
			return _getStatusCodeMessage( status );
		}
	};

	var resCode = _getResponseCode( status, request.url );
	var resBody = _getResponseBody( body, resCode, request.url );

	// Sending response to client
    response.status( resCode ).json( resBody );

    // Logging to gcp logs
    request.log.submit( resCode, JSON.stringify( resBody ).length );

    // Recording latency
    latencyMetric.write( Date.now() - request.startTimestamp );

}

function _forwardToGae( method, request, response, next ) {

	var api = request.path;

	// params
	var params = _getUrlParameters( request.url );
	if( response.locals[ "access-token" ] )
		params[ "accessToken" ] = response.locals[ "access-token" ];
	if( params[ "requests" ] )
		params[ "requests" ] = encodeURIComponent( params[ "requests" ] ); // Batch Requests -> encode string

	// url - before changing request headers
	var appengineUrl = _getAppengineEndpoint( request ) + api + "?" + _formatParams( params );

	// headers
	var ECSHostName = request.headers.host;
//	ECSHostName = "pr-hindi.ptlp.co";
	var validHeaders = [ 'content-type', 'user-agent' ];
	var _clean = function( headers ) {
		for( var header in headers ) {
			headers[ _normalizeHeaderCase( header ) ] = headers[ header ];
			delete headers[header];
		}
		return headers;
	};
	request.headers = _clean( _.pick( request.headers, validHeaders ) );
	request.headers[ "ECS-HostName" ] = ECSHostName;


	console.log( "GAE :: " + method + " :: " + appengineUrl + " :: " + JSON.stringify( request.headers ) );

	if( api === "/pratilipi/content/image" || api === "/event/banner" ) {
		var reqModule = method === "GET"
			? request.pipe( requestModule( appengineUrl ) )
			: request.pipe( requestModule.post( appengineUrl, request.body ) );
		var startTimestamp = Date.now();
		reqModule
			.on( 'end', function() {
			  console.log( `TIME TAKEN ${Date.now() - startTimestamp} msec FOR PIPE ${method} ${appengineUrl}` );
			})
			.pipe( response )
			.on( 'error', (error) => {
				_sendResponseToClient( request, response, 500, UNEXPECTED_SERVER_EXCEPTION );
			})
		;
	} else {
		_getHttpPromise( appengineUrl, method, request.headers, request.body )
			.then( res => {
				_sendResponseToClient( request, response, res.statusCode, res.body );
				next();
			})
			.catch( err => {
				console.log( "GAE_ERROR :: " + err.message );
				_sendResponseToClient( request, response, err.statusCode, err.error );
				next();
			})
		;
	}
}

function _getHttpPromise( uri, method, headers, body ) {
	var genericReqOptions = {
		uri: uri,
		method: method,
		agent : uri.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		json: true,
		simple: false,
		timeout: 120000, // 120 seconds
		resolveWithFullResponse: true
	};
	if( headers ) genericReqOptions.headers = headers;
	if( body ) genericReqOptions.form = body;
	var _hideSensitiveFields = function( obj ) {
		if( ! obj ) return {};
		var copyObj = JSON.parse( JSON.stringify( obj ) );
		var sensitiveFields = [ "password", "verificationToken" ];
		for( var i = 0; i < sensitiveFields.length; i++ ) if( copyObj[sensitiveFields[i]] ) copyObj[sensitiveFields[i]] = "******";
		return copyObj;
	};
	console.log( 'HTTP :: ' + method + " :: " + uri + " :: " + JSON.stringify( headers ) + " :: " + JSON.stringify( _hideSensitiveFields( body ) ) );
	var startTimestamp = Date.now();
	return httpPromise( genericReqOptions )
		.then( response => {
			console.log( `TIME TAKEN ${Date.now() - startTimestamp} msec FOR ${method} ${uri}` );
			return response;
		})
	;

}


function _getAuth( resource, method, primaryContentId, params, request, response ) {

	// Special case handling - auth_as in case of images
	if( authConfig[ resource ][ method ][ "auth_as" ] ) {
		return _getAuth( authConfig[ resource ][ method ][ "auth_as" ][ "resource" ],
						authConfig[ resource ][ method ][ "auth_as" ][ "method" ],
						primaryContentId,
						params,
						request,
						response );
	}

	var authParams = {};
	var paramsWhiteList = authConfig[ resource ][ method ][ "params" ];
	for( var i = 0; i < paramsWhiteList.length; i++ ) {
		var key = paramsWhiteList[i];
		if( params && params[key] && ! authParams[key] )
			authParams[key] = params[key];
	}

	if( primaryContentId ) {
		resource = resource.replace( "$primaryContentId", primaryContentId );
		authParams[ "id" ] = primaryContentId;
	}

	authParams[ "resource" ] = encodeURIComponent( resource );
	authParams[ "method" ] = method;

	var authEndpoint = ECS_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT + "?" + _formatParams( authParams );

	var headers = { 'Access-Token': response.locals[ "access-token" ] };

	return _getHttpPromise( authEndpoint, "GET", headers )
		.then( authResponse => {
			var isAuthorized = authResponse.body.data[0].isAuthorized;
			var statusCode = authResponse.body.data[0].code;
			if( ! isAuthorized ) {
				console.log( 'AUTHENTICATION_FAILED' );
				_sendResponseToClient( request, response, statusCode, ( statusCode === 401 || statusCode === 403 ) ? INSUFFICIENT_ACCESS_EXCEPTION : INVALID_ARGUMENT_EXCEPTION );
				return Promise.reject();
			} else {
				return authResponse.headers[ 'user-id' ];
			}
		}, (httpError) => {
			console.log( "ERROR_MESSAGE :: " + httpError.message );
			_sendResponseToClient( request, response, httpError.statusCode, httpError.error );
			return Promise.reject();
		});
	;

}


/*
	_getService() -> Generic function returning a httpPromise
	requestUrl is used for GET Batch calls,
	if requestUrl == null, fallback to request.url
*/

function _getService( method, requestUrl, request, response ) {

	if( requestUrl == null )
		requestUrl = request.url;

	var api = requestUrl.split( "?" )[0];
	var urlQueryParams = _getUrlParameters( requestUrl );

	var isGETRequest = method === "GET";

	var primaryKey = isGETRequest
		? routeConfig[api]["GET"].primaryKey
		: routeConfig[api]["POST"]["methods"][method].primaryKey;

	var params = isGETRequest ? urlQueryParams : request.body;
	var primaryContentId = params[ primaryKey ] ? params[ primaryKey ] : null;

	if( primaryContentId ) {
		delete urlQueryParams[ primaryKey ];
		delete request.body[ primaryKey ];
	}

	// headers
	var headers = { 'Access-Token': response.locals[ "access-token" ] };
	if( request.headers.version )
		headers[ "Version" ] = request.headers.version;

	// body
	var body = ( ( method === "POST" || method === "PATCH" ) && request.body ) ? request.body : null;

	var isAuthRequired = isGETRequest ? routeConfig[api]["GET"].auth : true; // true for all non-GET requests

	var servicePath = isGETRequest ? routeConfig[api]["GET"]["path"] : routeConfig[api]["POST"]["methods"][method]["path"];

	// TODO: Better implementation
	if( isGETRequest && routeConfig[api]["GET"][ "copyParam" ] ) {
		var copyParam = routeConfig[api]["GET"][ "copyParam" ];
		for( var i = 0; i < copyParam.length; i++ ) {
			var from = Object.keys( copyParam[i] )[0];
			var to = copyParam[i][ from ];
			if( urlQueryParams[from] ) {
				urlQueryParams[to] = urlQueryParams[from];
				delete urlQueryParams[from];
			}
		}
	}

	// Calling auth before replacing $primaryContentId
	var authPromise = isAuthRequired
		? _getAuth( servicePath, method, primaryContentId, params, request, response )
		: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

	// Replacing $primaryContentId
	servicePath = servicePath.replace( "$primaryContentId", primaryContentId );

	var serviceUrl = ECS_END_POINT + servicePath;
	if( ! _isEmpty( urlQueryParams ) ) serviceUrl += '?' + _formatParams( urlQueryParams );

	return authPromise
		.then( (userId) => {
			if( userId !== -1 ) headers[ "User-Id" ] = userId;
			return _getHttpPromise( serviceUrl, method, headers, body );
		})
	;

}

function _isGETApiSupported( url ) {
	var api = url.split("?")[0];
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	if( isApiSupported && routeConfig[api].GET.requiredFields ) {
		var requiredFields = routeConfig[api].GET.requiredFields;
		for( var i = 0; i < requiredFields.length; i++ ) {
			var fieldName = Object.keys( requiredFields[i] )[0];
			var fieldValue = requiredFields[i][ fieldName ];
			var params = _getUrlParameters( url );
			if( ! params[fieldName] || ( fieldValue !== null && fieldValue !== params[fieldName] ) ) {
				isApiSupported = false;
				break;
			}
		}
	}
	return isApiSupported;
}

function resolveGET( request, response, next ) {

	/*
	*	3 cases:
	*	1. images -> With or without authentication
	*	2. not supported in ecs && ( gamma || prod ) -> Forward request to Appengine
	*	3. not supported in ecs && devo environment -> Send 'not supported'
	*/

	// request.path will be /xxx
	var api = request.path;
	var isApiSupported = _isGETApiSupported( request.url );
	var isPipeRequired = isApiSupported && routeConfig[api].GET.shouldPipe;

	// For image requests
	if( isPipeRequired ) {
		var isAuthRequired = routeConfig[api].GET.auth;
		var resource = encodeURIComponent( routeConfig[api].GET.path );
		var primaryContentId = _getUrlParameter( request.url, routeConfig[api].GET.primaryKey );

		var authPromise = isAuthRequired
			? _getAuth( resource, "GET", primaryContentId, null, request, response )
			: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

		var url = ECS_END_POINT + routeConfig[api].GET.path + ( request.url.split('?')[1] ? ('?' + request.url.split('?')[1]) : '' );

		authPromise
			.then( (userId) => {
				var startTimestamp = Date.now();
				request.pipe( requestModule( url ) )
					.on( 'end', function() {
					  console.log( `TIME TAKEN ${Date.now() - startTimestamp} msec FOR PIPE GET ${url}` );
					})
					.pipe( response )
					.on( 'error', function( error ) {
						_sendResponseToClient( request, response, 500, UNEXPECTED_SERVER_EXCEPTION );
					})
				;
			});

	// Supported in ecs
	} else if( isApiSupported ) {

		var requestUrl = null;

		_getService( "GET", requestUrl, request, response )
			.then( (serviceResponse) => {
				_sendResponseToClient( request, response, serviceResponse.statusCode, serviceResponse.body );
			}, (httpError) => {
				// httpError will be null if Auth has rejected Promise
				if( httpError ) {
					console.log( "ERROR_STATUS :: " + httpError.statusCode );
					console.log( "ERROR_MESSAGE :: " + httpError.message );
					_sendResponseToClient( request, response, httpError.statusCode, httpError.body );
				}
			});
		;

	// Forward to appengine
	} else {
		_forwardToGae( "GET", request, response, next );
	}

}

function resolveGETBatch( request, response, next ) {

	/*
		Sample batch call request:
		/?requests={"req1":"/page?uri=/k-billa-ramesh/en-kanmani","req2":"/pratilipi?_apiVer=2&pratilipiId=$req1.primaryContentId"}

		Cases - Environment:
		1. If all requests are not supported -> Forward Request to appengine

		Cases - Serial / Parallel :
		1. If all requests are independent -> Use promise.all
		2. Else use sequential promises
	*/

	var requestsObject = _getUrlParameter( request.url, "requests" );

	// Hitting on /
	if( ! requestsObject )
		response.status( 400 ).send( "Well, Hello!" );

	var requests = JSON.parse( requestsObject );

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
			var url = decodeURIComponent( requests[req] );
			var api = url.split("?")[0];
			requestArray.push({
				"name": req,
				"url": url,
				"api": api,
				"isSupported": _isGETApiSupported(url),
				"isAuthRequired": _isGETApiSupported(url) && routeConfig[api].GET.auth
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
		_forwardToGae( "GET", request, response, next );

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
					var uri = _getAppengineEndpoint( request ) + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + response.locals[ "access-token" ];
					var headers = { "ECS-HostName": request.headers.host };
					promiseArray.push( _getHttpPromise( uri, "GET", headers ) );
				}
			});

			// Pretty simple with Promise.all, isn't it?
			Promise.all( promiseArray )
				.then( (responseArray) => { // responseArray will be in order
					var returnResponse = {}; // To be sent to client
					for( var i = 0; i < responseArray.length; i++ )
						returnResponse[ requestArray[i].name ] = { "status": responseArray[i].statusCode, "response": responseArray[i].body };
					_sendResponseToClient( request, response, 200, returnResponse );
				}).catch( (error) => {
					console.log( "ERROR_CAUSE :: Promise.all" );
					console.log( "ERROR_STATUS :: " + error.statusCode );
					console.log( "ERROR_MESSAGE :: " + error.message );
					_sendResponseToClient( request, response, 500, UNEXPECTED_SERVER_EXCEPTION );
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

			function recursiveGET( reqArray, responseObject ) {

				if( reqArray.length === 0 )
					return new Promise( function( resolve, reject ) { resolve( responseObject ) } );

				if( ! responseObject )
					responseObject = {}; // Initialising

				// Current request Object
				var req = reqArray[0];
				var promise;
				if( req.isSupported ) {
					promise = _getService( "GET", req.url, request, response );
				} else {
					var appengineUrl = _getAppengineEndpoint( request ) + req.url + ( req.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + response.locals[ "access-token" ];
					var headers = { "ECS-HostName": request.headers.host };
					promise = _getHttpPromise( appengineUrl, "GET", headers );
				}

				function _onRes( status, body ) {
					if( typeof(body) === 'object' ) {
						// Modifying other requests of the reqArray
						reqArray.forEach( (aReq) => {
							for( var key in body ) {
								var find = "$" + req.name + "." + key;
								if( aReq.url.indexOf( find ) !== -1 ) {
									aReq.url = aReq.url.replace( find, body[key] );
								}
							}
						});
					}
					responseObject[ req.name ] = { "status": status, "response": body }; // Populating the responseObject
					reqArray.shift();
				}

				return promise
					.then( (res) => {
						_onRes( res.statusCode, res.body );
						return recursiveGET( reqArray, responseObject );
					})
					.catch( (err) => {
						if( err ) {
							console.log( "ERROR_STATUS :: " + err.statusCode );
							console.log( "ERROR_MESSAGE :: " + err.message );
							_onRes( err.statusCode, err.error );
							return recursiveGET( reqArray, responseObject );
						} else {
							_sendResponseToClient( request, response, 500, UNEXPECTED_SERVER_EXCEPTION );
						}
					})
				;
			}

			recursiveGET( JSON.parse( JSON.stringify( requestArray ) ) ) // Cloning requestArray
				.then( (res) => {
					_sendResponseToClient( request, response, 200, res );
				})
			;
		}
	}
}

function resolvePOST( request, response, next ) {

	// TODO: Remove once everything is moved to ecs
	// url: /pratilipis/12345/review-data
	// body: reviewCount, ratingCount, totalRating
	// headers: Access-Token, User-Id
	if( request.path.startsWith( '/pratilipis/' ) && request.path.endsWith( '/review-data' ) ) {
		var url = ECS_END_POINT + request.path;
		var headers = {
			'User-Id': request.headers["user-id"],
			'Access-Token': request.headers["access-token"]
		};
		_getHttpPromise( url, "PATCH", headers, request.body )
			.then( res => {
				response.json( SUCCESS_MESSAGE );
				next();
			})
			.catch( err => {
				console.log( "REVIEW_DATA_PATCH_ERROR :: " + err.message );
				next();
			})
		;
		return;
	}

	// TODO: Remove once everything is moved to ecs
	// url: /authors/12345/follow-count
	// body: followCount
	// headers: Access-Token, User-Id
	if( request.path.startsWith( '/authors/' ) && request.path.endsWith( '/follow-count' ) ) {
		var arr = request.path.split( '/' );
		var authorId = arr[arr.length - 2];
		var url = ECS_END_POINT + "/authors/" + authorId;
		var headers = {
			'User-Id': request.headers["user-id"],
			'Access-Token': request.headers["access-token"]
		};
		_getHttpPromise( url, "PATCH", headers, request.body )
			.then( res => {
				response.json( SUCCESS_MESSAGE );
				next();
			})
			.catch( err => {
				console.log( "AUTHOR_FOLLOW_COUNT_FOLLOW_ERROR :: " + err.message );
				next();
			})
		;
		return;
	}

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

	var api = request.path;
	var isApiSupported = routeConfig[api] && routeConfig[api].POST;
	if( isApiSupported ) {
		var isPipeRequired = routeConfig[api].POST.shouldPipe;
		if( isPipeRequired ) {
			// Assumption: Only POST implementation in case of Image requests
			var resource = routeConfig[api].POST.path;
			var primaryKey = routeConfig[api]['POST']['methods']['POST'].primaryKey;
			var primaryContentId = _getUrlParameter( request.url, primaryKey );
			_getAuth( resource, "POST", primaryContentId, null, request, response )
				.then( (userId) => {
					request[ "headers" ][ "User-Id" ] = userId;
					request[ "headers" ][ "Access-Token" ] = response.locals[ "access-token" ];
					var url = ECS_END_POINT + resource;
					if( request.url.indexOf( "?" ) !== -1 ) url += "?" + request.url.split( "?" )[1];
					var startTimestamp = Date.now();
					request.pipe( requestModule.post( url, request.body ) )
						.on( 'error', (error) => {
							console.log( "ERROR_MESSAGE :: " + JSON.stringify(error) );
							response.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
						})
						.on('end', function() {
						  console.log( `TIME TAKEN ${Date.now() - startTimestamp} msec FOR PIPE POST ${url}` );
						})
						.pipe( response )
						.on( 'error', function(error) {
							console.log( "ERROR_MESSAGE :: " + JSON.stringify(error) );
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
		_forwardToGae( "POST", request, response, next );
	}

}

function _resolvePostPatchDelete( methodName, request, response ) {

	// Sanity check -> direct request from frontend
	var api = request.path;
	var isApiSupported = routeConfig[api] && routeConfig[api]["POST"]["methods"][methodName];

	if( isApiSupported ) {
		_getService( methodName, null, request, response )
			.then( (serviceResponse) => {
				_sendResponseToClient( request, response, serviceResponse.statusCode, serviceResponse.body );
			}, (httpError) => {
				// httpError will be null if Auth has rejected Promise
				if( httpError ) {
					console.log( "ERROR_STATUS :: " + httpError.statusCode );
					console.log( "ERROR_MESSAGE :: " + httpError.message );
					_sendResponseToClient( request, response, httpError.statusCode, httpError.error );
				}
			});
		;
	} else {
		response.send( "Api Not supported yet!" );
	}
}

const app = express();

app.use( morgan('short') );
app.use( cookieParser() );
app.use( bodyParser.json({ limit: "50mb" }) );
app.use( bodyParser.urlencoded({ extended: true, limit: "50mb" }) );

// for initializing log object
app.use( (request, response, next) => {
	var log = request.log = new Logging( request );
	request.startTimestamp = Date.now();
	next();
});

//CORS middleware
app.enable( 'trust proxy' );
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

	response.locals[ "access-token" ] = accessToken;
	next();

});

// Remove /api in the beginning
app.use( (request, response, next) => {
	// /api?requests=
	if( request.url.startsWith( '/api?' ) ) {
		request.path = "/";
		request.url = request.url.substr(4);
		request.url = "/" + request.url;

	// /api/?requests=
	// /api/xyz?param1=
	} else if( request.url.startsWith( '/api' ) ) {
		request.path = request.path.substr(4);
		request.url = request.url.substr(4);
	}
	next();
});

// get
app.get( ['/*'], (request, response, next) => {
	if( request.path === '/' ) {
		resolveGETBatch( request, response, next );
	} else {
		resolveGET( request, response, next );
	}
});

// post
app.post( ['/*'], (request, response, next) => {
	resolvePOST( request, response, next );
	// TODO: Uncomment once Frontend makes all calls
	// _resolvePostPatchDelete( "POST", request, response );
});

// TODO: Uncomment once Frontend makes all calls
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

// Clear AccessToken
app.use( (request, response, next) => {
	if( [ "/user/login",
			"/user/login/facebook",
			"/user/login/google",
			"/user/register",
			"/user/passwordupdate",
			"/user/verification",
			"/user/logout" ].indexOf( request.path ) > -1 ) {

		_getHttpPromise( ECS_END_POINT + "/auth/accessToken", "DELETE", { "Access-Token": response.locals[ "access-token" ] } )
			.then( authResponse => {
				next();
			})
			.catch( authError => {
				console.log( "DELETE_ACCESS_TOKEN_ERROR :: " + authError.message );
				next();
			})
		;
	}
	next();
});

// Debugging
app.use( (err, req, res, next) => {
	console.error( "ERROR_STACK :: ", err.stack );
	res.status(500).json( UNEXPECTED_SERVER_EXCEPTION );
});

process.on( 'unhandledRejection', function( reason, p ) {
	console.info( "Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason );
});

app.listen(80);
