'use strict';

const Resource = require('../resource');

module.exports = Resource.extend({
    path: 'resources/storage',

    createSignedUrl: Resource.method({
        method: Resource.POST,
        path: '/signed-url',
        apiVersion: 'v2'
    })
});
