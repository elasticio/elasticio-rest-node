var Resource = require("../resource.js");

//Warning! Internal API
module.exports = Resource.extend({
    path: 'sailor-support/hooks',
    create: Resource.method({
        method: Resource.POST,
        path: '/task/{taskId}/startup/data'
    }),

    delete: Resource.method({
        method: Resource.DELETE,
        path: '/task/{taskId}/startup/data'
    }),

    retrieve: Resource.method({
        method: Resource.GET,
        path: '/task/{taskId}/startup/data'
    })
});
