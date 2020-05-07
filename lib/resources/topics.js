const Resource = require('../resource.js');
module.exports = Resource.extend({
    path: 'workspaces/{wokspaceId}/topics',
    list: Resource.method({
        apiVersion: 'v2',
        path: '/'
    }),
    getOne: Resource.method({
        apiVersion: 'v2',
        path: '/{id}'
    })
});
