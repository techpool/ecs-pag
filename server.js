var express = require( 'express' );
var url = require('url');

const app = express();

app.get( '/health', (request, response, next) => {
	response.send( "healthy" );
});

app.get( '/api/test', (request, response, next) => {
	var query = url.parse( request.url, true ).query;
	var wait = query.wait ? parseInt(query.wait) : 1;
	setTimeout(function() {
		response.send( "hello" );
	}, wait );
});

app.listen(80);
