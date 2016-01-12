var Q = require("q");
var util = require("util");
var httpRequest = require("request");

module.exports = ApiResource;

function ApiResource(client) {
    this.client = client;
}

ApiResource.prototype.request = function request(method, path) {
    var api = this.client._api;

    var requestMethod = request[method];

    function createRequestOptions() {
        var options = {
            url: util.format("%s/%s", api.basePath, path),
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
    var Super = this;

    function Constructor() {
        Super.apply(this, arguments);
    }

    Constructor.prototype = Object.create(Super.prototype);

    for (var i in sub) {
        if (hasOwn.call(sub, i)) {
            Constructor.prototype[i] = sub[i];
        }
    }
    for (i in Super) {
        if (hasOwn.call(Super, i)) {
            Constructor[i] = Super[i];
        }
    }

    return Constructor;
};

ApiResource.method = function method(spec) {

    var verb = spec.method || ApiResource.GET;

    function sendRequest() {
        var self = this;
        var api = self.client._api;
        var path = self.path || '';
        var args = Array.prototype.slice.call(arguments);

        function provideOptions() {
            if (!path) {
                throw new Error("A resource mus define 'path'");
            }

            if (spec.path) {
                path = path + spec.path;
            }

            path = interpolatePath(path, args);

            var requestBody = provideBody(args);

            return createRequestOptions(verb, api, path, requestBody);
        }

        function sendRequest(requestOptions) {
            return Q.nfcall(httpRequest, requestOptions);
        }

        function prepareResponse(response, body) {
            if (spec.prepareResponse) {
                return spec.prepareResponse(response, body);
            }

            return body;
        }

        function checkStatusCode(response, body) {
            if (response.statusCode >= 400) {
              var error = new Error(body);
              error.statusCode = response.statusCode
              throw error;
            }

            return [response, body];
        }

        return Q()
            .then(provideOptions)
            .then(sendRequest)
            .spread(checkStatusCode)
            .spread(prepareResponse);
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

    function createRequestOptions(verb, api, path, body) {
        var options = {
            url: util.format("%s/%s", api.basePath, path),
            method: verb,
            json: true,
            auth: {
                username: api.user,
                password: api.password
            }
        };

        if (body) {
            options.body = body;
        }

        return options;
    }

    function provideBody(args) {

        return args[0];
    }

    return sendRequest;
};

ApiResource.GET = 'get';
ApiResource.POST = 'post';
ApiResource.PUT = 'put';
ApiResource.DELETE = 'delete';
