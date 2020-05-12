var Resource = require("../resource.js");

module.exports = Resource.extend({
    path: 'workspaces/{workspaceId}/secrets',

    retrieve: Resource.method({
        path: '/{id}',
        apiVersion: 'v2'
    })

});
