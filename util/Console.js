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
        request.headers[ "calling-agent" ] = service;
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