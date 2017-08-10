var HttpUtil = require( './util/HttpUtil' );
var express = require( 'express' );

const app = express();

app.get( '/health', (request, response, next) => {
	response.send( "healthy" );
});

app.get( '/api/test', (request, response, next) => {
	var url = "https://devo-pratilipi.appspot.com" + request.url;
	var httpUtil = new HttpUtil();
	httpUtil.get( url, null, null, function( res ) {
		response.send( res );
	});
});

app.listen(80);
