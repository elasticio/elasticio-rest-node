const httpRequest = require('requestretry');
const ON_NETWORK_ERROR = Symbol('ON_NETWORK_ERROR');
const ON_HTTP_OR_NETWORK_ERROR = Symbol('ON_HTTP_OR_NETWORK_ERROR');
const ON_HTTP_ERROR = Symbol('ON_HTTP_ERROR');

module.exports = {
    MAP: {
        [ON_NETWORK_ERROR]: httpRequest.RetryStrategies.NetworkError,
        [ON_HTTP_OR_NETWORK_ERROR]: httpRequest.RetryStrategies.HTTPOrNetworkError,
        [ON_HTTP_ERROR]: httpRequest.RetryStrategies.HTTPError
    },
    STRATEGIES: {
        ON_NETWORK_ERROR,
        ON_HTTP_OR_NETWORK_ERROR,
        ON_HTTP_ERROR
    }
};
