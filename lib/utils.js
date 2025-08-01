const axios = require('axios');
const http = require('http');
const https = require('https');

const DEFAULT_RETRIES_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_API_REQUEST_TIMEOUT = 15000;

const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

const sleep = async (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const axiosReqWithRetryOnServerError = async function (requestOptions, config = {}) {
  const {
    retriesCount = DEFAULT_RETRIES_COUNT,
    requestTimeout = DEFAULT_API_REQUEST_TIMEOUT,
    retryDelay = DEFAULT_RETRY_DELAY
  } = config;

  let response;
  let currentRetry = 0;
  let error;
  do {
    try {
      response = await axiosInstance.request({
        ...requestOptions,
        timeout: requestTimeout,
      });
      response.statusCode = response.status;
      response.body = response.data;
      response.headers = response.headers || {};
      response.request = requestOptions;
      return response;
    } catch (err) {
      error = err;
      if (err.response) {
        if (err.response.status < 500) throw error;
        error.statusCode = err.response.status;
        error.body = err.response.data;
        error.headers = err.response.headers;
        error.request = requestOptions;
      }
      await sleep(retryDelay);
      currentRetry++;
    }
  } while (currentRetry < retriesCount);
  throw error;
};

module.exports.axiosReqWithRetryOnServerError = axiosReqWithRetryOnServerError;