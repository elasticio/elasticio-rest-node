var Resource = require("../resource.js");

module.exports = Resource.extend({
    path: 'exec',

    schedule: Resource.method({
        method: Resource.POST,
        path: '/schedule'
    }),


    pollResult: Resource.method({
        path: '/poll/{id}'
    }),


    retrieveResult: Resource.method({
        path: '/result/{id}'
    })
});