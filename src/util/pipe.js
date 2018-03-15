const
    request = require('request');

const PipeUtil = function() {

    const self = this;

    self.pipe = (req, res, options) => {

        const 
            uri = options.uri || options.url,
            method = options.method || req.method,
            qs = options.query || req.query || {},
            headers = options.headers || req.headers || {},
            body = options.body || req.body || {};

        // Debugging
        console.log(`PIPE_REQUEST :: ${uri} :: ${method} :: ${JSON.stringify(qs)} :: ${JSON.stringify(headers)}`);

        return req.pipe(request({
            uri: uri,
            method: method,
            qs: qs,
            headers: headers,
            body: body,
            followAllRedirects: false,
            followRedirect: false,
            jar: true
        }))
        .on('response', (response) => {
            console.log(`PIPE_RESPONSE :: ${uri} :: ${method} :: ${response.statusCode} :: ${JSON.stringify(response.headers)}`);
            res.writeHead(response.statusCode, response.headers);
        })
        .pipe(res);

    };


    self.pipeToSgp = (req, res, options) =>
        self.pipe(req, res, Object.assign({}, options, {'uri': process.env.SGP_LB_ENDPOINT + req.originalUrl}));


};

module.exports = new PipeUtil();
