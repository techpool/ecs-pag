var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );
var Promise = require( 'bluebird' );
var express = require( 'express' );

var TIMEOUT_MILLISECONDS = 12000; // 120 seconds
var httpAgent = new http.Agent({ keepAlive : true, keepAliveMsecs: TIMEOUT_MILLISECONDS });
var httpsAgent = new https.Agent({ keepAlive : true, keepAliveMsecs: TIMEOUT_MILLISECONDS });

const app = express();

app.get( '/health', (request, response, next) => {
	response.send( "healthy" );
});

app.get( '/api/test', (request, response, next) => {
	var url = "https://devo-pratilipi.appspot.com" + request.url;
	var genericReqOptions = {
		url: url,
		method: "GET",
		agent : url.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		json: true,
		simple: false,
		timeout: TIMEOUT_MILLISECONDS,
		time: true,
		resolveWithFullResponse: true
	};
	console.log( "HTTP :: GET :: " + url );
	httpPromise( genericReqOptions )
		.then( res => {
			console.log( `TIME TAKEN ${res.elapsedTime} msec FOR ${url}` );
			response.status( res.statusCode ).send( res.body );
		})
		.catch( err => {
			console.log( "ERROR :: " + err.message );
			response.status( err.statusCode ).send( err.error );
		})
	;
});

app.listen(80);
