/* HttpUtil */
var XMLHttpRequest = require( "xmlhttprequest" ).XMLHttpRequest;

var HttpUtil = function() {

	function processResponseText( repsonseText ) {
		var res = {};
		try {
			res = JSON.parse( repsonseText );
		} catch( err ) {
			res[ "message" ] = "${ _strings.server_error_message }";
		}
		return res;
	};

	this.formatParams = function( params ) {
		if( params == null ) return "";
		if( typeof( params ) === "string" ) return params;
		return Object.keys( params ).map( function(key) { return key + "=" + params[key] }).join("&");
	};

	this.get = function( aUrl, headers, params, aCallback ) {
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() {
			if( anHttpRequest.readyState == 4 && aCallback != null )
				aCallback( processResponseText( anHttpRequest.responseText ), anHttpRequest.status, aUrl );
		};
		anHttpRequest.open( "GET", aUrl + ( aUrl.indexOf( "?" ) > -1 ? "&" : "?" ) + this.formatParams( params ), true );
		anHttpRequest.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		if( headers != null ) {
			for( var key in headers )
				if( headers.hasOwnProperty(key) )
					anHttpRequest.setRequestHeader( key, headers[key] );
		}
		anHttpRequest.send( null );
	};

	this.post = function( aUrl, headers, params, aCallback ) {
		if( 'onLine' in navigator ) {
			if( ! navigator[ 'onLine' ] ) {
				aCallback( { "message": "${ _strings.could_not_connect_server }" }, 0, aUrl );
				return;
			}
		}
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() {
			if( anHttpRequest.readyState == 4 && aCallback != null )
				aCallback( processResponseText( anHttpRequest.responseText ), anHttpRequest.status, aUrl );
		};
		anHttpRequest.open( "POST", aUrl, true );
		anHttpRequest.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		if( headers != null ) {
			for( var key in headers )
				if( headers.hasOwnProperty(key) )
					anHttpRequest.setRequestHeader( key, headers[key] );
		}
		anHttpRequest.send( this.formatParams( params ) );
	};

	this.getCORS = function( aUrl, headers, params, aCallback ) {
		function createCORSRequest( method, url ) {
			var anHttpRequest = new XMLHttpRequest();
			/* anHttpRequest.withCredentials = true; */
			if( "withCredentials" in anHttpRequest ) {
				anHttpRequest.open( method, url, true );
			} else if( typeof XDomainRequest != "undefined" ) {
				anHttpRequest = new XDomainRequest();
				anHttpRequest.open( method, url );
			} else {
				anHttpRequest = null;
			}
			return anHttpRequest;
		}
		var anHttpRequest = createCORSRequest( 'GET', aUrl + ( aUrl.indexOf( "?" ) > -1 ? "&" : "?" ) + this.formatParams( params ) );
		if( !anHttpRequest ) {
			console.log( 'CORS not supported by browser.' );
			return;
		}
		anHttpRequest.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		if( headers != null ) {
			for( var key in headers )
				if( headers.hasOwnProperty(key) )
					anHttpRequest.setRequestHeader( key, headers[key] );
		}
		anHttpRequest.onload = function() {
			aCallback( processResponseText( anHttpRequest.responseText ), anHttpRequest.status, aUrl );
		};
		anHttpRequest.onerror = function( e ) {
			console.log( 'Error making the request: ', e );
		};
		anHttpRequest.send();
	};

};

module.exports = HttpUtil;
