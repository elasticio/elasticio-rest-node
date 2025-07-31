const API_RETRIES_COUNT = {
  minValue: 0,
  defaultValue: 3,
  maxValue: 5
};
const ENV_API_RETRIES_COUNT = process.env.API_RETRIES_COUNT ? parseInt(process.env.API_RETRIES_COUNT, 10) : API_RETRIES_COUNT.defaultValue;

const API_REQUEST_TIMEOUT = {
  minValue: 500,
  defaultValue: 15000,
  maxValue: 120000
};

const getRetryOptions = () => {
  const ENV_API_REQUEST_TIMEOUT = process.env.API_REQUEST_TIMEOUT ? parseInt(process.env.API_REQUEST_TIMEOUT, 10) : API_REQUEST_TIMEOUT.defaultValue;
  return {
    retriesCount: (ENV_API_RETRIES_COUNT > API_RETRIES_COUNT.maxValue || ENV_API_RETRIES_COUNT < API_RETRIES_COUNT.minValue)
      ? API_RETRIES_COUNT.defaultValue
      : ENV_API_RETRIES_COUNT,
    requestTimeout: (ENV_API_REQUEST_TIMEOUT > API_REQUEST_TIMEOUT.maxValue || ENV_API_REQUEST_TIMEOUT < API_REQUEST_TIMEOUT.minValue)
      ? API_REQUEST_TIMEOUT.defaultValue
      : ENV_API_REQUEST_TIMEOUT
  };
};

const exponentialDelay = (currentRetries) => {
  const maxBackoff = 15000;
  const delay = (2 ** currentRetries) * 100;
  const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return Math.min(delay + randomSum, maxBackoff);
};

const sleep = async (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const exponentialSleep = async (currentRetries) => sleep(exponentialDelay(currentRetries));

const axiosReqWithRetryOnServerError = async function (options, axiosInstance = axios) {
  const { retriesCount, requestTimeout } = getRetryOptions();
  let response;
  let currentRetry = 0;
  let error;
  while (currentRetry < retriesCount) {
    try {
      response = await axiosInstance.request({
        ...options,
        timeout: requestTimeout,
        validateStatus: (status) => (status >= 200 && status < 300)
      });
      return response;
    } catch (err) {
      error = err;
      if (err.response?.status < 500) {
        throw error;
      }
      await exponentialSleep(currentRetry);
      currentRetry++;
    }
  }
  throw error;
};

module.exports.axiosReqWithRetryOnServerError = axiosReqWithRetryOnServerError;