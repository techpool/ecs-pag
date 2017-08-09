var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );
var Promise = require( 'bluebird' );
var express = require( 'express' );

var httpAgent = new http.Agent({ keepAlive : true });
var httpsAgent = new https.Agent({ keepAlive : true });

function _getHttpPromise( uri, method, headers, body ) {
	var genericReqOptions = {
		uri: uri,
		method: method,
		agent : uri.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		json: true,
		simple: false,
		timeout: 120000, // 120 seconds
		time: true,
		resolveWithFullResponse: true
	};
	if( headers ) genericReqOptions.headers = headers;
	if( body ) genericReqOptions.form = body;
	console.log( 'HTTP :: ' + method + " :: " + uri + " :: " + JSON.stringify( headers ) + " :: " + JSON.stringify( body ) );
	return httpPromise( genericReqOptions )
		.then( res => {
			console.log( `TIME TAKEN ${res.elapsedTime} msec FOR ${method} ${uri}` );
			return res;
		})
	;
}

const app = express();

app.get( '/health', (request, response, next) => {
	response.send( "healthy" );
});

app.get( '/test', (request, response, next) => {
	var url = "https://devo-pratilipi.appspot.com/api" + request.url;
	_getHttpPromise( url, "GET" )
		.then( res => {
			response.status( res.statusCode ).send( res.body );
		})
		.catch( err => {
			console.log( "ERROR :: " + err.message );
			response.status( err.statusCode ).send( err.error );
		})
	;
});

app.listen(80);
