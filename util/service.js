const 
    _           = require('lodash'),
	co          = require('co');

const 
    mainConfig = require('./../config/main')[ process.env.STAGE || 'local' ],
    pathConfig = require('./../config/path'),
    Response   = require('./../entity/response'),
    httpUtil   = require('./http');

String.prototype.replaceAll = function(search, replacement) { return this.split(search).join(replacement) };

const ServiceUtil = function() {

    const _getPathConfig = (path) => _.filter(pathConfig, (v, k) => new RegExp(k).test(path))[0];

    const _getQuery = (regex, string, matches) =>
        string.match(new RegExp(regex)).reduce((prev, el, index, array) =>
            matches[index] ? _.extend(prev, { [matches[index]]: array[index+1] }) : prev, {});

    const _service = (method, path, $h, $qs, $b) =>
        co(function * () {

            const config = (x = _getPathConfig(path) ) && x[method];
            if (!config)
                return new Response(404, {message: 'Api not found.'});

            const $q = config.$q ? _getQuery(config.$q.match, path, config.$q.group) : {};
            $qs = $qs || {}, $b = $b || {}, $h = $h || {};

            if (config.auth) {

                const authParams = _
                    .chain(config.auth)
                    .mapValues((v, k) => {
                        _.forEach($q, ($v, $k) => v = v.replaceAll(`$q.${$k}`, $v));
                        _.forEach($qs, ($v, $k) => v = v.replaceAll(`$qs.${$k}`, $v));
                        _.forEach($b, ($v, $k) => v = v.replaceAll(`$b.${$k}`, $v));
                        _.forEach($h, ($v, $k) => v = v.replaceAll(`$h.${$k}`, $v));
                        return v;
                    })
                    .pickBy((v, k) => v.indexOf('$') === -1)
                    .value();

                const authResponse = yield httpUtil.get(
                    mainConfig.API_END_POINT + mainConfig.AUTHENTICATION_ENDPOINT,
                    $h,
                    authParams
                ).catch(() => -1);

                if (authResponse === -1) {
                    return new Response(500, {message: 'Some exception occured at the server. Please try again.'});
                }
                else if (authResponse.statusCode !== 200) {
                    return new Response(authResponse.statusCode, authResponse.body.message);
                }
                else if (!authResponse.body.data[0].isAuthorized) {
                    return new Response(authResponse.body.data[0].code, 'You are not authorised to perform this action!');
                }

                // Add User-Id to headers
                $h['User-Id'] = authResponse.headers[ 'user-id' ];

            }

            const serviceResponse = yield httpUtil.request(method, mainConfig.API_END_POINT + path, $h, $qs, $b).catch(() => -1);
            if (serviceResponse === -1) {
                return new Response(500, {message: 'Some exception occured at the server. Please try again.'});
            }

            return new Response(serviceResponse.statusCode, serviceResponse.body);

        });


    // Public Methods
    this.get = (path, headers, query) => _service('GET', path, headers, query);
    this.post = (path, headers, body) => _service('POST', path, headers, null, body);
    this.patch = (path, headers, body) => _service('PATCH', path, headers, null, body);
    this.delete = (path, headers, body) => _service('DELETE', path, headers, null, body);

};

module.exports = new ServiceUtil();
