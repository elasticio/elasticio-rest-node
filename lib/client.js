module.exports = ElasticIO;


ElasticIO.API_BASE_URL = 'https://api.elastic.io';
ElasticIO.API_VERSION = 'v1';


var resources = {
    accounts: require('./resources/accounts'),
    components: require('./resources/components'),
    exec: require('./resources/exec'),
    recipes: require('./resources/recipes'),
    resources : {
        s3: require('./resources/s3')
    },
    repos: require('./resources/repos'),
    sshkeys: require('./resources/sshkeys'),
    tasks: require('./resources/tasks'),
    teams: require('./resources/teams'),
    users: require('./resources/users')
};

function ElasticIO(user, password) {
    var self = this;
    this._api = {
        user: user,
        password: password,
        basePath: ElasticIO.API_BASE_URL + '/' + ElasticIO.API_VERSION
    };

    prepareResources(self, resources);

    return this;
}

function prepareResources(container, resources) {
    var self = this;

    for (var next in resources) {
        var name = next.toLowerCase();
        var value = resources[next];

        if (typeof value === 'object') {
            container[name] = {};
            prepareResources(container[name], value);
        } else {
            container[name] = new resources[next](self);
        }

    }

}