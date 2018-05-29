var AWS = require("aws-sdk");
const now = require('nano-time');

AWS.config.update({
  region: "ap-south-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "sot";

DynamoDb.prototype.put = function(language, access_token, user_id) {
    // body...

    language = language || "notavailable";
    let shortlanguage = {
        "hindi":"hi",
        "gujarati":"gu",
        "bengali":"bn",
        "telugu":"te",
        "marathi":"mr",
        "tamil":"ta",
        "kannada":"kn",
        "malayalam":"ml",
        "notavailable":"na"
    }
    let ts = now().slice(-5)
    var params = {
        TableName:table,
        Item:{
            "sot_id":`${shortlanguage[language.toLowerCase()]}.${access_token}.${user_id||0}.${ts}`,
            "ts": ts,
            "access_token": access_token,
            "version":"1.0",
            "language":language,
            "user_id": user_id || 0
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2),params);
        } else {
            console.log("Added item:", params);
        }
    });
};




function DynamoDb() {}

module.exports = new DynamoDb();