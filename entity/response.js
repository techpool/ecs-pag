const Response = function(code, body) {
    return {
        "code": code || 200,
        "body": body || {message: 'OK'}
    };
};

module.exports = Response;
