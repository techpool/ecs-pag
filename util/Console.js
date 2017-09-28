const uniqid = require('uniqid');
const bigqueryClient = require( '@google-cloud/bigquery' );

var bigquery;
var table;

class Console {

    static init(config) {
        bigquery = bigqueryClient({ projectId: config.project }).dataset( config.dataset);
        table = bigquery.table(config.table);
        return this;
    }

    // used only by PAG to create new log id
    getUid() {
        return uniqid();
    }


    log(response, reponseCode ,id, request, agent, time) {

        console.log(response);

        var row = {
            insertId: id,
            json: {
                ID: id,
                AGENT: agent,
                RESPONSE_CODE: reponseCode,
                RESPONSE: response,
                LATENCY: time,
                REQUEST: request
            }
        };

        var options = {
            raw: true
        };

        table.insert(row, options, this.insertHandler);
    };

    insertHandler(err, apiResponse){
        if(err) {
            console.error(`Error while inserting In BigQuery` + err);
        } else {
            console.log( `records inserted !` + JSON.stringify(apiResponse) );
        }
    }
};

module.exports = Console;