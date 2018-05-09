var snsConfig = require('../config/sns.js')[ process.env.STAGE || 'local' ];

var bluebird = require('bluebird');

var AWS = require('aws-sdk');
AWS.config.update({region: snsConfig.REGION});
var sns = new AWS.SNS();
var topic = snsConfig.TOPIC;

function SNS() {

}

SNS.prototype.push = function( accessToken, method, headers, queryParams, url, path, client ) {
	if( topic == null ) {
		return;
	}

	var data = {accessToken, method, headers, queryParams, url, path, client};

  var params = {
    Message: JSON.stringify(data),
    TopicArn: topic,
    MessageAttributes: {
      'event': {
        DataType: 'String', /* required */
        StringValue: "PAG.ROUTE"
      },
      'version': {
        DataType: 'String', /* required */
        StringValue: "2.1"
      },        
    }      
  };

  sns.publish(params, function (err, data1) {
    if (err) {
      console.error("SNS_EVENT_FAILED" + err);
    } else {
      console.log("SNS_EVENT_PUSHED" + JSON.stringify(data1));
    }
  });
};


module.exports = new SNS();