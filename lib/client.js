module.exports = ElasticIO;
const { axiosReqWithRetryOnServerError } = require('./utils');
module.exports.axiosReqWithRetryOnServerError = axiosReqWithRetryOnServerError;


ElasticIO.API_DEFAULT_BASE_URL = 'https://api.elastic.io';

const resources = {
  accounts: require('./resources/accounts'),
  components: require('./resources/components'),
  exec: require('./resources/exec'),
  recipes: require('./resources/recipes'),
  resources: {
    s3: require('./resources/s3'),
    storage: require('./resources/storage')
  },
  repos: require('./resources/repos'),
  sshkeys: require('./resources/sshkeys'),
  tasks: require('./resources/tasks'),
  teams: require('./resources/teams'),
  users: require('./resources/users'),
  secrets: require('./resources/secrets'),
  topics: require('./resources/topics')
};

function ElasticIO(user, password, options = {}) {
  const baseUri = (process.env.ELASTICIO_API_URI || ElasticIO.API_DEFAULT_BASE_URL).replace(/\/+$/, '');
  this._api = {
    user: user || process.env.ELASTICIO_API_USERNAME,
    password: password || process.env.ELASTICIO_API_KEY,
    basePath: baseUri
  };

  this.options = { ...options };

  prepareResources(this, resources, this.options);

  return this;
}

function prepareResources(container, resources, options = {}) {
  for (const key of Object.keys(resources)) {
    const name = key.toLowerCase();
    const value = resources[key];

    if (typeof value === 'object' && !('prototype' in value)) {
      container[name] = {};
      prepareResources(container[name], value, options);
    } else {
      container[name] = new value(this);
    }
  }
}
