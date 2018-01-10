//Imports the Google Api client library
var google = require( 'googleapis' );

//Your Google Cloud Platform project ID and service name
var projectId;
var service;
var logging;

//Authenticate the client with the credentials provided
( function authenticate() {
  google.auth.getApplicationDefault( ( err, authClient ) => {
    if( err ) {
      console.error( 'LogginGcp: Failed to get the default credentials: ' +  err );
      setTimeout( authenticate, 15 * 1000 );
    }
    if( authClient.createScopedRequired && authClient.createScopedRequired() ) {
      authClient = authClient.createScoped( [ 'https://www.googleapis.com/auth/logging.write' ] );
    }
    logging = google.logging( { version: 'v2beta1', auth: authClient } );
  } );
} )();



class LoggingGcp {

  //initialize the logEntry variable
  constructor( request ) {

    this.logEntry = {
      logName: `projects/${ projectId }/logs/${ service }`,
      resource: { type: 'container' },
      entries: [ {
        timestamp: this.getDate(),
        protoPayload: {
          '@type': 'type.googleapis.com/google.appengine.logging.v1.RequestLog',
          line: []
        }
      } ]
    };

    if( typeof request === 'object' ) {
      var payload = this.logEntry.entries[ 0 ].protoPayload;
      payload.method = request.method;
      payload.resource = request.url;
      payload.userAgent = request.headers[ 'user-agent' ];
      payload.ip = request.ip;
      this.logEntry.labels = { requestId: request.headers[ 'x-request-id' ] };
    } else {
      this.logEntry.labels = { requestId: request };
    }

  }

  //initialize the projectId and service
  static init( config ) {
    projectId = config.projectId;
    service = config.service;
    return this;
  }

  //add valid line
  info( message ) {
    this.addLine( 200, message );
  }

  //add error line
  error( message ) {
    this.addLine( 500, message );
  }

  //add lines in a log
  addLine( severity, logMessage ) {
    this.logEntry.entries[ 0 ].protoPayload.line.push( {
      severity: severity,
      logMessage: logMessage,
      time: this.getDate()
    } );
  }

  //add resource
  setResource( resource ) {
    this.logEntry.entries[ 0 ].protoPayload.resource = resource;
  }

  //Name of the agent calling
  setUserAgent( userAgent ) {
    this.logEntry.entries[ 0 ].protoPayload.userAgent = userAgent;
  }


  //Submit the log to GCP
  submit( status, responseSize ) {
    if( logging ) {
      var entry = this.logEntry.entries[ 0 ];
      var payload = entry.protoPayload;
      payload.status = status;
      payload.responseSize = responseSize;
      payload.latency = ( new Date().getTime() - new Date( entry.timestamp ) ) / 1000 + 's';

      entry.severity = this.getSeverity( entry );

      logging.entries.write( { resource: this.logEntry }, ( err, result ) => {
        if( err ) {
          console.error( 'LoggingGcp: ' + err );
        }
      } );
    } else {
      var self = this;
      setTimeout( () => {
        self.submit();
      }, 15000 ); // retry after 15 seconds
    }
  }


  //Timestamp
  getDate() {
    return new Date().toISOString();
  }

  //Max of each response for severity
  getSeverity( entry ) {
    var severityArray = entry.protoPayload.line.map( function( line ) {
      return line.severity;
    } );
    return Math.max( ...severityArray );
  }

}

module.exports = LoggingGcp;
