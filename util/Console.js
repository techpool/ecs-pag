const bigqueryClient = require('@google-cloud/bigquery');

var bigquery;
var table;

class Console {

    static init(config) {
        bigquery = bigqueryClient({projectId: config.project}).dataset(config.dataset);
        table = bigquery.table(config.table);
        return this;
    }

    changeAgent(request, service) {
        request.headers[ "User-Agent" ] = service;
    }

    submit(request, response) {
        console.log(request.headers["x-amzn-trace-id"]);

        var id = request.headers["x-amzn-trace-id"];
        var insertId = (new Date()).getTime().toString();

        if (!id){
            id = insertId;
        }

        var row = {
            insertId: insertId,
            json: {
                ID: id,
                AGENT: JSON.stringify(request.headers["User-Agent"]),
                RESPONSE_CODE: response.statusCode,
                RESPONSE: response.body,
                LATENCY: new Date() - request.startTimestamp,
                REQUEST: request.originalUrl,
                REQUEST_BODY: JSON.stringify(request.body),
                TIMESTAMP: (new Date()).getTime()
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
}

module.exports = Console;