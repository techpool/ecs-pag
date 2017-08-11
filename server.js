var http = require( 'http' );
var express = require( 'express' );
var url = require('url');
var timeout = require('connect-timeout')

const app = express();

app.get( '/health', (request, response, next) => {
	response.send( "healthy" );
});

app.get( '/api/test', (request, response, next) => {
	var query = url.parse( request.url, true ).query;
	var wait = query.wait ? parseInt(query.wait) : 1;
	console.log( 'waiting for ' + wait + 'seconds ...' );
	if( query.id ) console.log( 'id :: ' + query.id );
	setTimeout(function() {
		response.send( "Yello!" );
	}, wait );
});


var server = http.createServer(app);
server.setTimeout(11*60*1000); // 10 * 60 seconds * 1000 msecs
server.listen(80);
server.on( 'connection', function(socket) {
	console.log( "A new connection was made by a client." );
	socket.setTimeout(30 * 1000); // 30 second timeout. Change this as you see fit.
});
