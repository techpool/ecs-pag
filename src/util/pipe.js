const
    request = require('request');

const PipeUtil = function() {

    const self = this;

    self._getSGPEndpoint = (stage = (process.env.STAGE || 'local')) => {
        if (process.env.SGP_LB_ENDPOINT)
            return process.env.SGP_LB_ENDPOINT;
        switch (stage) {
            case 'local':
                return 'http://localhost:8081';
            case 'devo':
                return '';
            case 'gamma':
                return 'http://gamma-lb-pub-1256019773.ap-southeast-1.elb.amazonaws.com';
            case 'prod':
                return 'http://prod-lb-pub-1761987772.ap-southeast-1.elb.amazonaws.com';
        }
    },

    self.pipe = (req, res, options) => {

        const 
            uri = options.uri || options.url,
            method = options.method || req.method,
            qs = Object.assign({}, req.query, options.query),
            headers = Object.assign({}, req.headers, options.headers),
            body = req.body || undefined;

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
        self.pipe(req, res, Object.assign({}, options, {'uri': self._getSGPEndpoint() + req.originalUrl}));

};

module.exports = new PipeUtil();
