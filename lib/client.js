module.exports = ElasticIO;


ElasticIO.API_BASE_URL = 'https://api.elastic.io';
ElasticIO.API_VERSION = 'v1';


var resources = {
    components: require('./resources/components'),
    repos: require('./resources/repos'),
    sshkeys: require('./resources/sshkeys'),
    tasks: require('./resources/tasks'),
    users: require('./resources/users')
};

function ElasticIO(user, password) {
    var self = this;
    this._api = {
        user: user,
        password: password,
        basePath: ElasticIO.API_BASE_URL + '/' + ElasticIO.API_VERSION
    };

    prepareResources();

    function prepareResources() {

        for (var next in resources) {
            var name = next.toLowerCase();

            this[name] = new resources[next](self);
        }

    }

    return this;
}