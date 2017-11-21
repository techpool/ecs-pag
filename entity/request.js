const Request = function(method, path, headers, qs, body) {
    return {
        method: method.toUpperCase(),
        path: path,
        $h: headers || {},
        $qs: qs || {},
        $b: body || {}
    };
};

module.exports = Request;
