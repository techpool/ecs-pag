const winston = require('winston');
const date_time = require('moment-timezone');
const on_headers = require('on-headers');
const on_finished = require('on-finished');
const continuation_local_storage = require('continuation-local-storage');

const winston_config = winston.config;

var winstonLogger = new winston.Logger({
  transports: [
    new winston.transports.Console({
        level : process.env.STAGE === 'prod' ? 'info' : 'debug',
        showLevel : false
    } )
  ],
  exitOnError: false
});


const getNamespace = continuation_local_storage.getNamespace;
const createNamespace = continuation_local_storage.createNamespace;
const createRequest = createNamespace( 'Request-Id' );
const getRequest = getNamespace( 'Request-Id' );
const check = [];


const ANDROID_ENDPOINTS = [ "temp.pratilipi.com", "android.pratilipi.com", "app.pratilipi.com", "android-gamma.pratilipi.com", "android-gamma-gr.pratilipi.com", "android-devo.ptlp.co" ];
const DICTIONARY = '0123456789abcdefghijklmnopqrstuvwxyz';
const uuidLength = 6;

Array.prototype.contains = function ( obj ) {
    return this.indexOf( obj ) > -1;
};

function logger() {
}

logger.prototype.log = function( level, message ) {
    // body...
    winstonLogger.log( formatterMessage( level, message ) );
};

logger.prototype.info = function( message ) {
    // body...
    winstonLogger.info( formatterMessage( 'info', message ) );
};

logger.prototype.debug = function( message ) {
    // body...
    winstonLogger.debug( formatterMessage( 'debug', message ) );
};

logger.prototype.error = function( message ) {
    // body...
    winstonLogger.error( formatterMessage( 'error', message ) );
};

logger.prototype.logger = function( req, res, next ) {
    // create requestId and append it in header as Request-Id...
    req._logStartTime = process.hrtime();

    on_finished( res, function() {
        res._logEndTime = process.hrtime();
        winstonLogger.info( formatterHTTP( 'info', req, res ) );
    } );

    if( req.headers[ 'Request-Id'.toLowerCase() ] == null ) {
        var requestId = createUnique( req );
        req.headers[ 'Request-Id'.toLowerCase() ] = requestId;
        createRequest.run( function() {
            createRequest.set( 'Request-Id', requestId );
            next();
        } );
    } else {
        var requestId = req.headers[ 'Request-Id'.toLowerCase() ];
        createRequest.run( function() {
            createRequest.set( 'Request-Id', requestId );
            next();
        } );
    }
};

function createUnique( req ) {
    var realm = getRealm( req ) || 'pr';
    var client = getClient( req );
    var uuid = getUuid( uuidLength );
    var page = getPage( req ) || 'undefined';
    var requestId = realm + client + uuid + page;
    if( check.contains( requestId ) ) {
        var requestId2 = createUnique( req );
        return requestId2;
    } else {
        check.push( requestId );
        return requestId;
    }
}

function getRealm( req ) {
    
}

function getClient( req ) {
    var clientType = ANDROID_ENDPOINTS.contains( req.headers.host ) ? "a" : "w";
    return clientType;
    
}

function getUuid( uuidLength ) {
    // logic 1
    var uuid = Math.random().toString( 36 ).substr( 2, uuidLength );
    return uuid;
    // logic 2 Duplicates are generated more frequently
    // var uuid = "";
    // for( var i = 0; i < uuidLength; i++ ) {
    //     uuid += DICTIONARY.charAt( parseInt( Math.random() * DICTIONARY.length) % DICTIONARY.length );
    // }
    // return uuid;
    // logic 3 Duplicates are generated more frequently
    // var uuid = "";
    // for( var i = 0; i < uuidLength; i++ ) {
    //     uuid += DICTIONARY.charAt( Math.floor( Math.random() * DICTIONARY.length ) %DICTIONARY.length );
    // }
    // return uuid;
}

function getPage( req ) {
    
}

function formatterMessage( logLevel, message ) {
    var timestamp = dateTimeIST();
    logLevel = getLogLevel( logLevel );
    var requestId = getRequestId();
    var serviceName = getServiceName();
    var formattedMessage = `[${ timestamp }] [${ logLevel }] [${ requestId }] [${ serviceName }] ${ message }`;
    return formattedMessage;
}

function dateTimeIST() {
    return `${ date_time( new Date() ).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss.SSS') }`;
}

function getLogLevel( logLevel ) {
    return logLevel.toLowerCase();
}

function getLogLevelWithColor( logLevel ) {
    return winston_config.colorize( logLevel, logLevel.toLowerCase() );
}

function getRequestId() {
    return getRequest && getRequest.get( 'Request-Id' ) ? getRequest.get( 'Request-Id' ) : '';
}

function getRequestIdAfterFinished( req ) {
    return getRequest && getRequest.get( 'Request-Id' ) ? getRequest.get( 'Request-Id' ) : req.headers[ 'Request-Id'.toLowerCase() ];
}

function getServiceName() {
    return process.env.APP_NAME || 'local';
}

function formatterHTTP( logLevel, req, res ) {
    var timestamp = dateTimeIST();
    logLevel = getLogLevel( logLevel );
    var requestId = getRequestIdAfterFinished( req );
    var serviceName = getServiceName();
    var httpMessage = buildHTTPMessage( req, res );
    var formattedHTTPMessage = `[${ timestamp }] [${ logLevel }] [${ requestId }] [${ serviceName }] ${ httpMessage }`;
    return formattedHTTPMessage;
}

function buildHTTPMessage( req, res ) {
    return `[${ req.method }] [${ req.originalUrl || req.url }] [${ res.statusCode }] [${ res.getHeader( 'Content-Length' ) }] [${ ( ( res._logEndTime[ 0 ] - req._logStartTime[ 0 ] ) * 1e3 + ( res._logEndTime[ 1 ] - req._logStartTime[ 1 ] ) * 1e-6 ).toFixed(3) }ms]`;
}

module.exports = new logger();