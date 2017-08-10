var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );
var Promise = require( 'bluebird' );
var express = require( 'express' );
var timeout = require( 'connect-timeout' );

var httpAgent = new http.Agent({ keepAlive : true, keepAliveMsecs: 120000 });
var httpsAgent = new https.Agent({ keepAlive : true, keepAliveMsecs: 120000 });

const app = express();
app.use( timeout( 120000 ) );

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
		timeout: 120000, // 120 seconds
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

app.use( haltOnTimedout );
function haltOnTimedout( request, response, next ) {
	if( ! request.timedout ) next();
	else response.send( "Request timedout" );
}

app.listen(80);
