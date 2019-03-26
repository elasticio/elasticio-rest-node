const Q = require('q');
const util = require('util');
const debug = require('debug')('elasticio-rest-node:resource');
const httpRequest = require('requestretry');
const API_VERSION = 'v1';

module.exports = ApiResource;

function ApiResource(client) {
    this.client = client;
}

ApiResource.prototype.request = function request(method, path) {
    var api = this.client._api;

    var requestMethod = request[method];

    function createRequestOptions() {
        var options = {
            url: util.format('%s/%s', api.basePath, path),
            json: true,
            auth: {
                username: api.user,
                password: api.password
            }
        };

        return options;
    }

    function prepareResponse(response, body) {
        console.log(response);
    }

    return Q.nfcall(requestMethod, createRequestOptions())
        .spread(prepareResponse);
};

var hasOwn = {}.hasOwnProperty;

ApiResource.extend = function extend(sub) {
    var self = this;

    function Constructor() {
        self.apply(this, arguments);
    }

    Constructor.prototype = Object.create(self.prototype);

    for (var i in sub) {
        if (hasOwn.call(sub, i)) {
            Constructor.prototype[i] = sub[i];
        }
    }
    for (i in self) {
        if (hasOwn.call(self, i)) {
            Constructor[i] = self[i];
        }
    }

    return Constructor;
};

ApiResource.method = function method(spec) {
    var verb = spec.method || ApiResource.GET;
    async function sendRequest(...args) {

        var self = this;
        var api = self.client._api;
        var path = self.path || '';

        debug('Got args: %j', args);
        debug('Got spec: %j', spec);
        function provideOptions() {
            if (!path) {
                throw new Error("A resource must define 'path'");
            }

            if (spec.path) {
                path = path + spec.path;
                path = (spec.apiVersion || API_VERSION) + '/' + path;
            }
            path = interpolatePath(path, args);
            const [requestBody, options] = args;

            return createRequestOptions(verb, api, path, requestBody, options);
        }


        const response = await httpRequest(provideOptions());
        const { body, statusCode } = response;

        if (statusCode >= 400) {
            var message = typeof body === 'object' ? JSON.stringify(body) : body;

            var error = new Error(message);
            error.statusCode = statusCode;

            throw error;
        }

        if (spec.prepareResponse) {
            return spec.prepareResponse(response, body);
        }

        return body;
    }

    function interpolatePath(path, args) {
        var parameters = path.match(/{(\w+)}/g);
        debug('From interpolatePath: Got path: %j', path);
        console.log('-------------/n');
        console.log('argv', process.argv);
        console.log('env', process.env);

        console.log('-------------/n');

        if (!parameters) {
            return path;
        }

        for (var index in parameters) {
            var param = parameters[index];

            var value = args.shift();

            if (!value) {
                throw new Error(util.format(
                    "Missing value for parameter '%s'. Please provide argument: %s",
                    param, index));
            }

            path = path.replace(param, value);
        }

        return path;
    }

    function createRequestOptions(verb, api, path, body, { retryCount, retryDelay } = {}) {
        var options = {
            url: util.format('%s/%s', api.basePath, path),
            method: verb,
            json: true,
            auth: {
                username: api.user,
                password: api.password
            },
            maxAttempts: retryCount || 3,
            retryDelay: retryDelay || 100,
            retryStrategy: httpRequest.RetryStrategies.NetworkError,
            fullResponse: true
        };

        if (body) {
            options.body = body;
        }

        return options;
    }

    return sendRequest;
};

ApiResource.GET = 'get';
ApiResource.POST = 'post';
ApiResource.PUT = 'put';
ApiResource.DELETE = 'delete';
