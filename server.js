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

const APPENGINE_ENDPOINT = mainConfig.APPENGINE_ENDPOINT;
const ECS_END_POINT = process.env.API_END_POINT.indexOf( "http" ) === 0 ? process.env.API_END_POINT : ( "http://" + process.env.API_END_POINT );

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

function _addRespectiveServiceHeaders( res, serviceReturnedHeaders ) {
	var pagHeaders = [ 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers' ];
	var serviceHeaders = _.omit( serviceReturnedHeaders, pagHeaders );
	res.set( serviceHeaders );
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

	console.log( "INVALID_RESPONSE_CODE :: " + code );

	if( code >= 200 && code < 300 )
		return 200;
	else if( code >= 400 && code < 500 )
		return 400;
	else
		return 500;

}

function _forwardToGae( method, req, res ) {

	var api = req.path.startsWith( "/api" ) ? req.path.substr(4) : req.path;
	var params = _getUrlParameters( req.url );
	params[ "accessToken" ] = res.locals[ "access-token" ];
	var appengineUrl = APPENGINE_ENDPOINT + api + "?" + _formatParams( params );
	req.headers[ "ECS-HostName" ] = req.headers.host;

	console.log( "GAE :: " + method + " :: " + appengineUrl + " :: " + JSON.stringify( req.headers ) );

	var reqModule;
	if( method === "GET" ) {
		reqModule = req.pipe( requestModule( appengineUrl ) );
	} else if( method === "POST" && ( api === "/pratilipi/content/image" || api === "/event/banner" ) ) {
		reqModule = req.pipe( requestModule.post( appengineUrl, req.body ) );
	} else {
		reqModule = requestModule.post( appengineUrl, { form: req.body } );
	}

	reqModule
		.on( 'error', (error) => {
			res.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
			req.log.error( JSON.stringify( error ) );
			req.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the request!' );
			latencyMetric.write( Date.now() - req.startTimestamp );
		})
		.pipe( res )
		.on( 'error', (error) => {
			res.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
			req.log.error( JSON.stringify( error ) );
			req.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the response!' );
			latencyMetric.write( Date.now() - req.startTimestamp );
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
	if( body ) genericReqOptions.form = body;
	console.log( 'HTTP :: ' + method + " :: " + uri + " :: " + JSON.stringify( headers ) + " :: " + JSON.stringify( body ) );
	return httpPromise( genericReqOptions );
}


function _getAuth( resource, method, primaryContentId, params, req, res ) {

	// Special case handling - auth_as in case of images
	if( authConfig[ resource ][ method ][ "auth_as" ] ) {
		return _getAuth( authConfig[ resource ][ method ][ "auth_as" ][ "resource" ],
						authConfig[ resource ][ method ][ "auth_as" ][ "method" ],
						primaryContentId,
						params,
						req,
						res );
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

	var headers = { 'Access-Token': res.locals[ "access-token" ] };

	return _getHttpPromise( authEndpoint, "GET", headers )
		.then( authResponse => {
			var isAuthorized = authResponse.body.data[0].isAuthorized;
			var statusCode = authResponse.body.data[0].code;
			if( ! isAuthorized ) {
				res.status( _getResponseCode( statusCode ) ).send( INSUFFICIENT_ACCESS_EXCEPTION );
				console.log( 'AUTHENTICATION_FAILED' );
				req.log.submit( statusCode, JSON.stringify( authResponse.body ).length );
				latencyMetric.write( Date.now() - req.startTimestamp );
				return Promise.reject();
			} else {
				console.log( 'AUTHENTICATION_SUCCESSFUL' );
				return authResponse.headers[ 'user-id' ];
			}
		}, (httpError) => {
			console.log( "ERROR_MESSAGE :: " + httpError.message );
			res.status( _getResponseCode( httpError.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
			req.log.submit( 500, httpError.message.length );
			latencyMetric.write( Date.now() - req.startTimestamp );
			return Promise.reject();
		});
	;

}


/*
	_getService() -> Generic function returning a httpPromise
	requestUrl is used for GET Batch calls,
	if requestUrl == null, fallback to req.url
*/

function _getService( method, requestUrl, req, res ) {

	if( requestUrl == null )
		requestUrl = req.url.startsWith( '/api' ) ? req.url.substr(4) : req.url;

	var api = requestUrl.split( "?" )[0];
	var urlQueryParams = _getUrlParameters( requestUrl );

	var isGETRequest = method === "GET";

	var primaryKey = isGETRequest
		? routeConfig[api]["GET"].primaryKey
		: routeConfig[api]["POST"]["methods"][method].primaryKey;

	var params = isGETRequest ? urlQueryParams : req.body;
	var primaryContentId = params[ primaryKey ] ? params[ primaryKey ] : null;

	if( primaryContentId ) {
		delete urlQueryParams[ primaryKey ];
		delete req.body[ primaryKey ];
	}

	// headers
	var headers = { 'Access-Token': res.locals[ "access-token" ] };
	if( req.headers.version )
		headers[ "Version" ] = req.headers.version;

	// body
	var body = ( ( method === "POST" || method === "PATCH" ) && req.body ) ? req.body : null;

	var isAuthRequired = isGETRequest ? routeConfig[api]["GET"].auth : true; // true for all non-GET requests

	var servicePath = isGETRequest ? routeConfig[api]["GET"]["path"] : routeConfig[api]["POST"]["methods"][method]["path"];

	// Calling auth before replacing $primaryContentId
	var authPromise = isAuthRequired
		? _getAuth( servicePath, method, primaryContentId, params, req, res )
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

function resolveGET( req, res ) {

	/*
	*	3 cases:
	*	1. images -> With or without authentication
	*	2. not supported in ecs && ( gamma || prod ) -> Forward request to Appengine
	*	3. not supported in ecs && devo environment -> Send 'not supported'
	*/

	// req.path will be /api/xxx or /xxx (android)
	var api = req.path.startsWith( '/api' ) ? req.path.substr(4) : req.path;
	var isApiSupported = routeConfig[api] && routeConfig[api].GET;
	var isPipeRequired = isApiSupported && routeConfig[api].GET.shouldPipe;

	// For image requests
	if( isPipeRequired ) {
		var isAuthRequired = routeConfig[api].GET.auth;
		var resource = encodeURIComponent( routeConfig[api].GET.path );
		var primaryContentId = _getUrlParameter( req.url, routeConfig[api].GET.primaryKey );

		var authPromise = isAuthRequired
			? _getAuth( resource, "GET", primaryContentId, null, req, res )
			: new Promise( function( resolve, reject ) { resolve(-1); }); // userId = 0 for non-logged in users

		var url = ECS_END_POINT + routeConfig[api].GET.path + ( req.url.split('?')[1] ? ('?' + req.url.split('?')[1]) : '' );

		authPromise
			.then( (userId) => {
				req.pipe( requestModule( url ) )
					.on( 'error', function( error ) {
						res.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
						req.log.error( JSON.stringify( error ) );
						req.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the request!' );
						latencyMetric.write( Date.now() - req.startTimestamp );
					})
					.pipe( res )
					.on( 'error', function( error ) {
						res.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
						req.log.error( JSON.stringify( error ) );
						req.log.submit( error.statusCode || 500, error.message || 'There was an error forwarding the response!' );
						latencyMetric.write( Date.now() - req.startTimestamp );
					})
				;
			});

	// Supported in ecs
	} else if( isApiSupported ) {

		var requestUrl = null;
		// TODO: Implement cleaner solution
		if( api == '/pratilipi/list' ) {
			var params = _getUrlParameters( req.url );
			if( params[ "authorId" ] && params[ "state" ] ) {
				var params = _getUrlParameters( req.url );
				if( params[ "resultCount" ] ) {
					params[ "limit" ] = params[ "resultCount" ]
					delete params[ "resultCount" ];
				}
				requestUrl = api + "?" + _formatParams( params );
			} else {
				_forwardToGae( "GET", req, res );
				return;
			}
		}

		_getService( "GET", requestUrl, req, res )
			.then( (serviceResponse) => {
				_addRespectiveServiceHeaders( res, serviceResponse.headers );
				res.status( _getResponseCode( serviceResponse.statusCode ) ).send( serviceResponse.body );
				req.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - req.startTimestamp );
			}, (httpError) => {
				// httpError will be null if Auth has rejected Promise
				if( httpError ) {
					console.log( "ERROR_STATUS :: " + httpError.statusCode );
					console.log( "ERROR_MESSAGE :: " + httpError.message );
					res.status( _getResponseCode( httpError.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
					req.log.error( JSON.stringify( httpError.message ) );
					req.log.submit( httpError.statusCode || 500, httpError.message.length );
					latencyMetric.write( Date.now() - req.startTimestamp );
				}
			});
		;

	// Forward to appengine
	} else {
		_forwardToGae( "GET", req, res );
	}

}

function resolveGETBatch( req, res ) {

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
	if( ! req.url.startsWith( "/api?requests=" ) )
		res.status( 400 ).send( "Bad Request !" );

	var requests = JSON.parse( decodeURIComponent( req.url.substring( "/api?requests=".length ) ) );

	/* requestArray -> Contains all necessary fields for processing in next steps
		name -> name of the request (req1)
		url -> complete url of the request (/page?uri=/k-billa-ramesh/en-kanmani)
		api -> api to hit (/page)
		isSupported -> Implemented in ecs or not
		isAuthRequired -> no need to explain
	*/
	var requestArray = [];
	for( var aReq in requests ) {
		if( requests.hasOwnProperty(aReq) ) {
			var api = requests[aReq].split( "?" )[0];
			requestArray.push({
				"name": aReq,
				"url": requests[aReq],
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
		_forwardToGae( "GET", req, res );

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
			requestArray.forEach( (aReq) => {
				var url;
				if( aReq.isSupported ) {
					promiseArray.push( _getService( "GET", aReq.url, req, res ) );
				} else {
					var uri = APPENGINE_ENDPOINT + aReq.url + ( aReq.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + res.locals[ "access-token" ];
					var headers = { "ECS-HostName": req.headers.host };
					promiseArray.push( _getHttpPromise( uri, "GET", headers ) );
				}
			});

			// Pretty simple with Promise.all, isn't it?
			Promise.all( promiseArray )
				.then( (responseArray) => { // responseArray will be in order
					var returnResponse = {}; // To be sent to client
					for( var i = 0; i < responseArray.length; i++ )
						returnResponse[ requestArray[i].name ] = { "status": 200, "response": responseArray[i].body };
					res.send( returnResponse );
					req.log.submit( 200, JSON.stringify( returnResponse ).length );
					latencyMetric.write( Date.now() - req.startTimestamp );
				}).catch( (error) => {
					console.log( "ERROR_CAUSE :: Promise.all" );
					console.log( "ERROR_STATUS :: " + error.statusCode );
					console.log( "ERROR_MESSAGE :: " + error.message );
					res.status(500).send( UNEXPECTED_SERVER_EXCEPTION );
					req.log.error( error.statusCode ); // 'Bad Request'
					req.log.error( error.message ); // Html
					req.log.submit( 500, error.message.length );
					latencyMetric.write( Date.now() - req.startTimestamp );
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
				var aReq = reqArray[0];
				var promise;
				if( aReq.isSupported ) {
					promise = _getService( "GET", aReq.url, req, res );
				} else {
					var appengineUrl = APPENGINE_ENDPOINT + aReq.url + ( aReq.url.indexOf( '?' ) === -1 ? '?' : '&' ) + 'accessToken=' + res.locals[ "access-token" ];
					var headers = { "ECS-HostName": req.headers.host };
					promise = _getHttpPromise( appengineUrl, "GET", headers );
				}

				return promise
					.then( (res) => {
						var responseJson = res.body;
						// Modifying other requests of the reqArray
						reqArray.forEach( (reqq) => {
							for( var key in responseJson ) {
								var find = "$" + aReq.name + "." + key;
								if( reqq.url.indexOf( find ) !== -1 ) {
									reqq.url = reqq.url.replace( find, responseJson[key] );
								}
							}
						});
						responseObject[ aReq.name ] = { "status": 200, "response": responseJson }; // Populating the responseObject
						reqArray.shift();
						return recursiveGET( reqArray, responseObject );
					}, (error) => {
						// error might be null from Promise.reject() thrown by the same block
						if( error ) {
							console.log( "ERROR_STATUS :: " + error.statusCode );
							console.log( "ERROR_MESSAGE :: " + error.message );
							res.status( _getResponseCode( error.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
							req.log.error( error.message );
							req.log.submit( error.statusCode, error.message.length );
							latencyMetric.write( Date.now() - req.startTimestamp );
							return Promise.reject();
						}
					})
				;
			}

			recursiveGET( JSON.parse( JSON.stringify( requestArray ) ) ) // Cloning requestArray
				.then( (res) => {
					if( res ) {
						res.send( res );
						req.log.submit( 200, JSON.stringify( res ).length );
						latencyMetric.write( Date.now() - req.startTimestamp );
					}
				})
			;
		}
	}
}

function resolvePOST( req, res ) {

	// TODO: Remove once everything is moved to ecs
	// url: /api/pratilipis/12345/review-data
	// body: reviewCount, ratingCount, totalRating
	// headers: AccessToken, User-Id
	if( req.path.startsWith( '/api/pratilipis/' ) && req.path.endsWith( '/review-data' ) ) {
		var url = ECS_END_POINT + req.path.substr(4);
		var headers = {
			'Access-Token': req.headers.accesstoken,
			'User-Id': req.headers["user-id"]
		};
		requestModule.patch( url, { form: req.body, headers: headers } ).pipe( res );
		return;
	}

	// TODO: Remove once everything is moved to ecs
	// url: /api/authors/12345/follow-count
	// body: followCount
	// headers: AccessToken, User-Id
	if( req.path.startsWith( '/api/authors/' ) && req.path.endsWith( '/follow-count' ) ) {
		var arr = req.path.split( '/' );
		var authorId = arr[arr.length - 2];
		var url = ECS_END_POINT + "/authors/" + authorId;
		var headers = {
			'Access-Token': req.headers.accesstoken,
			'User-Id': req.headers["user-id"]
		};
		requestModule.patch( url, { form: req.body, headers: headers } ).pipe( res );
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

	var api = req.path.startsWith( '/api' ) ? req.path.substr(4) : req.path;
	var isApiSupported = routeConfig[api] && routeConfig[api].POST;
	if( isApiSupported ) {
		var isPipeRequired = routeConfig[api].POST.shouldPipe;
		if( isPipeRequired ) {
			// Assumption: Only POST implementation in case of Image requests
			var resource = routeConfig[api].POST.path;
			var primaryKey = routeConfig[api]['POST']['methods']['POST'].primaryKey;
			var primaryContentId = _getUrlParameter( req.url, primaryKey );
			_getAuth( resource, "POST", primaryContentId, null, req, res )
				.then( (userId) => {
					req[ "headers" ][ "User-Id" ] = userId;
					req[ "headers" ][ "Access-Token" ] = res.locals[ "access-token" ];
					var url = ECS_END_POINT + resource;
					if( req.url.indexOf( "?" ) !== -1 ) url += "?" + req.url.split( "?" )[1];
					req.pipe( requestModule.post( url, req.body ) )
						.on( 'error', (error) => {
							console.log( "ERROR_MESSAGE :: " + JSON.stringify(error) );
							res.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
						})
						.pipe( res )
						.on( 'error', function(error) {
							console.log( "ERROR_MESSAGE :: " + JSON.stringify(error) );
							res.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
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
							if( ! req.body[fieldName] || ( fieldValue !== null && fieldValue !== req.body[fieldName] ) ) {
								fieldsFlag = false;
								continue loop1;
							}
						}
					if( fieldsFlag ) {
						break loop1;
					}
				}

			if( fieldsFlag ) {
				_resolvePostPatchDelete( methodName, req, res );
			} else {
				res.send( "Method not yet supported!" );
			}
		}

	// Forward to appengine
	} else {
		_forwardToGae( "POST", req, res );
	}

}

function _resolvePostPatchDelete( methodName, req, res ) {

	// Sanity check -> direct request from frontend
	var api = req.path.startsWith( '/api' ) ? req.path.substr(4) : req.path;
	var isApiSupported = routeConfig[api] && routeConfig[api]["POST"]["methods"][methodName];

	if( isApiSupported ) {
		_getService( methodName, null, req, res )
			.then( (serviceResponse) => {
				_addRespectiveServiceHeaders( res, serviceResponse.headers );
				res.status( _getResponseCode( serviceResponse.statusCode ) ).send( serviceResponse.body );
				req.log.submit( serviceResponse.statusCode, JSON.stringify( serviceResponse.body ).length );
				latencyMetric.write( Date.now() - req.startTimestamp );
			}, (httpError) => {
				// httpError will be null if Auth has rejected Promise
				if( httpError ) {
					console.log( "ERROR_STATUS :: " + httpError.statusCode );
					console.log( "ERROR_MESSAGE :: " + httpError.message );
					res.status( _getResponseCode( httpError.statusCode ) ).send( UNEXPECTED_SERVER_EXCEPTION );
					req.log.error( JSON.stringify( httpError.message ) );
					req.log.submit( httpError.statusCode || 500, httpError.message.length );
					latencyMetric.write( Date.now() - req.startTimestamp );
				}
			});
		;
	} else {
		res.send( "Api Not supported yet!" );
	}
}

const app = express();

app.use( morgan('short') );
app.use( cookieParser() );
app.use( bodyParser.json({ limit: '50mb' }) );
app.use( bodyParser.urlencoded({ extended: true, limit: '50mb' }) );

// for initializing log object
app.use( (req, res, next) => {
	var log = req.log = new Logging( req );
	req.startTimestamp = Date.now();
	next();
});

//CORS middleware
app.use( (req, res, next) => {
	res.setHeader( 'Access-Control-Allow-Origin', "*" ); //TODO: add only pratilipi origin
	res.setHeader( 'Access-Control-Allow-Credentials', true );
	res.setHeader( 'Access-Control-Allow-Methods', 'GET, OPTIONS, POST' );
	res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, AccessToken, Origin, Version' );
	next();
});

app.options( "/*", (req, res, next) => {
	res.send(200);
});

app.get( "/health", (req, res, next) => {
	res.send( 'Pag ' + process.env.STAGE + ' is healthy !' );
});

// Setting access-token in res.locals
app.use( (req, res, next) => {

	var accessToken = null;
	if( req.headers.accesstoken )
		accessToken = req.headers.accesstoken;
	else if( req.cookies[ "access_token" ] )
		accessToken = req.cookies[ "access_token" ];
	else if( _getUrlParameter( req.url, "accessToken" ) )
		accessToken = _getUrlParameter( req.url, "accessToken" );

	res.locals[ "access-token" ] = accessToken;
	next();

});

// get
app.get( ['/*'], (req, res, next) => {
	if( req.path === '/api' ) {
		resolveGETBatch( req, res );
	} else if( req.path.startsWith( '/api/' ) ) {
		resolveGET( req, res );
	}
});

// post
app.post( ['/*'], (req, res, next) => {
	resolvePOST( req, res );
	// TODO: Uncomment once Frontend makes all calls
	// _resolvePostPatchDelete( "PATCH", req, res );
});

// TODO: Uncomment once Frontend makes all calls
/*
// patch
app.patch( ['/*'], (req, res, next) => {
	_resolvePostPatchDelete( "PATCH", req, res );
});

// delete
app.delete( ['/*'], (req, res, next) => {
	_resolvePostPatchDelete( "DELETE", req, res );
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
