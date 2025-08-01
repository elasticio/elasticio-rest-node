const { axiosReqWithRetryOnServerError } = require('./utils');
const API_VERSION = 'v1';

class ApiResource {
  constructor(client) {
    this.client = client;
  }

  static extend(sub) {
    class SubResource extends this { }
    Object.assign(SubResource.prototype, sub);
    Object.assign(SubResource, this);
    return SubResource;
  }

  static method(spec) {
    const verb = spec.method || ApiResource.GET;
    return async function (...args) {
      const client = this.client;
      const defaultOptions = client.options || {};
      const api = client._api;
      let path = this.path || '';

      if (!path) throw new Error("A resource must define 'path'");

      if (spec.path) {
        path += spec.path;
        path = `${spec.apiVersion || API_VERSION}/${path}`;
      }
      path = interpolatePath(path, args);

      const [requestBody, options] = args;
      const mergedOptions = { ...defaultOptions, ...(options || {}) };

      const requestOptions = createAxiosRequestOptions(verb, api, path, requestBody, mergedOptions);

      let response
      try {
        response = await axiosReqWithRetryOnServerError(requestOptions);
      } catch (error) {
        if (error.response) {
          const { data, status } = error.response;
          const message = typeof data === 'object' ? JSON.stringify(data) : (data || '');
          const e = new Error(message);
          e.statusCode = status;
          throw e;
        }
        error.req = { path: requestOptions.url };
        throw error;
      }

      const { data, status } = response;

      if (status >= 400) {
        const message = typeof data === 'object' ? JSON.stringify(data) : (data || '');
        const error = new Error(message);
        error.statusCode = status;
        throw error;
      }
      response.req = { path: requestOptions.url };

      if (spec.prepareResponse) {
        return spec.prepareResponse(response, data);
      }
      return data;
    };
  }
}

function interpolatePath(path, args) {
  const parameters = path.match(/{(\w+)}/g);
  if (!parameters) return path;

  let newPath = path;
  for (const [index, param] of parameters.entries()) {
    const value = args.shift();
    if (value === undefined) {
      throw new Error(
        `Missing value for parameter '${param}'. Please provide argument: ${index}`
      );
    }
    newPath = newPath.replace(param, value);
  }
  return newPath;
}

function createAxiosRequestOptions(verb, api, path, body, options = {}) {
  return {
    url: `${api.basePath}/${path}`,
    method: verb,
    headers: {
      Connection: 'Keep-Alive',
      ...(options?.headers || {})
    },
    auth: {
      username: api.user,
      password: api.password
    },
    ...(body ? { data: body } : {})
  };
}


ApiResource.GET = 'get';
ApiResource.POST = 'post';
ApiResource.PUT = 'put';
ApiResource.DELETE = 'delete';

module.exports = ApiResource;
