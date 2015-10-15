var Q = require("q");
var util = require("util");
var request = require("request");

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

        if (!path) {
            throw new Error("A resource mus define 'path'");
        }

        if (spec.path) {
            path = path + spec.path;
        }

        path = interpolatePath(path, arguments);

        var requestBody = provideBody(verb, arguments);

        var requestOptions = createRequestOptions(verb, api, path, requestBody);

        function prepareResponse(response, body) {
            return body;
        }

        return Q.nfcall(request, requestOptions)
            .spread(prepareResponse);
    }

    function interpolatePath(path, args) {
        var argsCount = args.length;

        var parameters = path.match(/{(\w+)}/g);

        if (!parameters) {
            return path;
        }

        var parametersCount = parameters.length;

        if (argsCount < parametersCount) {
            throw new Error(util.format(
                "Function called with %s parameters, but %s were specified",
                argsCount,
                parametersCount));
        }

        for (var index in parameters) {
            path = path.replace(parameters[index], args[index]);
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

    function provideBody(verb, args) {
        if (verb === ApiResource.POST || verb === ApiResource.PUT) {
            return args.length && args[0];
        }

        return null;
    }

    return sendRequest;
};

ApiResource.GET = 'get';
ApiResource.POST = 'post';
ApiResource.PUT = 'put';
ApiResource.DELETE = 'delete';
