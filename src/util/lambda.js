const AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-south-1"
});
const lambda = new AWS.Lambda();

LambdaUtil.prototype.fcmToken = function(userId, fcmToken, appVersion) {
	// body...
	let params = {
		FunctionName:'put_fcm_token',
	    InvocationType:'RequestResponse',
	    LogType:'Tail',
	    Payload:JSON.stringify({"user_id":Number(userId), "token": fcmToken, "appVersion": appVersion})
	}

	lambda.invoke(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log("fcmToken pushed");           // successful response
	});

};


function LambdaUtil() {}

module.exports = new LambdaUtil();