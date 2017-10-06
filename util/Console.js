const mainConfig = require( './../config/main' )[ process.env.STAGE || 'local' ];
const bigqueryClient = require('@google-cloud/bigquery');

var bigquery;
var table;
var startTimestamp;

class Console {

    static init(config) {
        bigquery = bigqueryClient({projectId: mainConfig.BIGQUERY_PROJECT}).dataset(mainConfig.BIGQUERY_DATASET);
        table = bigquery.table(mainConfig.LOGGING_TABLE);
        return this;
    }

    constructor(){
        startTimestamp = new Date();
    }

    changeAgent(request) {
        request.headers[ "calling-agent" ] = process.env.APP_NAME;
    }

    submit(request, response) {
        var id = request.headers["x-amzn-trace-id"];
        var insertId = (new Date()).getTime().toString();

        if (!id){
            id = insertId;
        }

        var agent = request.headers[ "calling-agent" ];
        if (!agent){
            agent = request.headers["User-Agent"];
        }

        var row = {
            insertId: insertId,
            json: {
                ID: id,
                AGENT: agent,
                RESPONSE_CODE: response.statusCode,
                RESPONSE: JSON.stringify(response.body),
                LATENCY: new Date() - startTimestamp,
                REQUEST: request.originalUrl,
                REQUEST_BODY: JSON.stringify(request.body),
                TIME_STAMP: this.getIstTime()
            }
        };

        var options = {
            raw: true
        };

        table.insert(row, options, this.insertHandler);
    };

    insertHandler(err, apiResponse) {
        if (err) {
            console.error(`Error while inserting In BigQuery` + err);
        } else {
            console.log(`records inserted !` + JSON.stringify(apiResponse));
        }
    };

    getIstTime(){
        var UTC = new Date();
        var IST = new Date(UTC.getTime()); // Clone UTC Timestamp
        IST.setHours(IST.getHours() + 5); // set Hours to 5 hours later
        IST.setMinutes(IST.getMinutes() + 30); // set Minutes to be 30 minutes later
        var istTime = IST.toString('dddd MMM yyyy h:mm:ss');
        return istTime;
    }
}

module.exports = Console;