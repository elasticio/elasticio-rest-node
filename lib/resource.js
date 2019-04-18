const util = require('util');
const httpRequest = require('requestretry');
const API_VERSION = 'v1';
const _ = require('lodash');
const {
    MAP: RETRY_STRATEGIES_MAP,
    STRATEGIES: { ON_HTTP_OR_NETWORK_ERROR }
} = require('./retryStrategies');

module.exports = ApiResource;


function ApiResource(client) {
    this.client = client;
}

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
    const verb = spec.method || ApiResource.GET;
    async function sendRequest(...args) {
        const defaultOptions = this.client.options || {};
        var self = this;
        var api = self.client._api;
        var path = self.path || '';

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

            return createRequestOptions(verb, api, path, requestBody, _.defaults(options || {}, defaultOptions));
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

    function createRequestOptions(
        verb,
        api,
        path,
        body,
        {
            retryCount,
            retryDelay,
            retryStrategy
        } = {}
    ) {
        const defaultRetryStrategy = RETRY_STRATEGIES_MAP[ON_HTTP_OR_NETWORK_ERROR];
        var options = {
            url: util.format("%s/%s", api.basePath, path),
            method: verb,
            json: true,
            forever: true,
            headers: {
                Connection: 'Keep-Alive'
            },
            auth: {
                username: api.user,
                password: api.password
            },
            maxAttempts: retryCount || 3,
            retryDelay: retryDelay || 100,
            retryStrategy: retryStrategy ? RETRY_STRATEGIES_MAP[retryStrategy] : defaultRetryStrategy,
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
