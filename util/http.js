const
    _       = require('lodash'),
    request = require('request'),
    requestPromise = require('request-promise');

const
    http = require('http'),
    https = require('https'),
    httpAgent = new http.Agent({keepAlive : true}),
    httpsAgent = new https.Agent({keepAlive : true});


const HttpUtil = function() {

    const _hideSensitiveFields = (obj) =>
        _.transform(obj, (r={},v,k) =>
            r[k] = _.indexOf(['password', 'token', 'verificationToken', 'googleIdToken', 'fbUserAccessToken'], k) === -1 ? v : '******');

    const _getRequestPromise = (method, uri, headers, qs, body) => {
        // TODO: Calling agent in header -> Logging in bigquery
        let options = {
            method: method,
            uri: uri,
            headers: headers || {},
            agent : uri.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
            encoding: 'utf8',
            json: true,
            simple: false,
            contentType: 'application/x-www-form-urlencoded',
            time: true,
            timeout: 60000, // 60 seconds
            resolveWithFullResponse: true
        };

        if (headers) options.headers = headers;
        if (qs) options.qs = qs;
        if (body) options.form = body;

        console.log(`INFO :: HTTP_REQUEST :: ${method} :: ${uri}${headers?' :: '+JSON.stringify(headers):''}${qs?' :: '+JSON.stringify(qs):''}${body?' :: '+JSON.stringify(_hideSensitiveFields(body)):''}`);
        return requestPromise(options)
            .then((response) => {
                console.log(`SUCCESS :: HTTP_RESPONSE :: ${method} :: ${uri} :: TIME_TAKEN ${response.elapsedTime} ms`);
                return response;
            })
            .catch((err) => {
                console.error(`ERROR :: HTTP_ERROR :: ${method} :: ${uri} :: ${err.message}`);
                throw err;
            })
        ;
    };

    // Public Methods
    this.get = (uri, headers, qs) => _getRequestPromise('GET', uri, headers, qs);
    this.post = (uri, headers, body) => _getRequestPromise('POST', uri, headers, null, body);
    this.patch = (uri, headers, body) => _getRequestPromise('PATCH', uri, headers, null, body);
    this.delete = (uri, headers, body) => _getRequestPromise('DELETE', uri, headers, null, body);
    this.request = (method, uri, headers, qs, body) => _getRequestPromise(method, uri, headers, qs, body);

};

module.exports = new HttpUtil();
