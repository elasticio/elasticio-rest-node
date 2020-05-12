describe('/workspaces', function () {
    const client = require("../../lib/client")("root", "secret");
    const secrets = client.secrets;
    const nock = require('nock');

    describe('/{id}/secrets', function() {
        describe('/{secretId}', function() {
            it('should send request successfully', function (done) {
                const response = {
                    'id': '54f4be3fe7d5224f91000002',
                    'type': 'auth-secret',
                    'attributes': {
                        'name': 'secret-name',
                        'credentials': {},
                        'state': 'secret-state'
                    },
                    'relationships': {
                        'workspace': {
                            'data': {
                                'id': '54f4be3fe7d5224f91000001',
                                'type': 'workspace'
                            },
                            'links': {
                                'self': '/v2/workspaces/54f4be3fe7d5224f91000001'
                            }
                        },
                        'user': {
                            'data': {
                                'id': '54f4be3fe7d5224f91000003',
                                'type': 'user'
                            },
                            'links': {
                                'self': '/v2/users/54f4be3fe7d5224f91000003'
                            }
                        },
                        'auth_client': {
                            'data': {
                                'id': '54f4be3fe7d5224f91000004',
                                'type': 'auth-client'
                            },
                            'links': {
                                'self': '/v2/tenants/54f4be3fe7d5224f91000005/auth-clients/54f4be3fe7d5224f91000004'
                            }
                        }
                    },
                    'links': {
                        'self': '/v2/workspaces/54f4be3fe7d5224f91000001/secrets/54f4be3fe7d5224f91000002'
                    }
                };

                nock('https://api.elastic.io')
                    .matchHeader('Connection', 'Keep-Alive')
                    .get('/v2/workspaces/54f4be3fe7d5224f91000001/secrets/54f4be3fe7d5224f91000002')
                    .basicAuth({
                        user: 'root',
                        pass: 'secret'
                    })
                    .reply(200, response);

                secrets.retrieve('54f4be3fe7d5224f91000001', '54f4be3fe7d5224f91000002')
                    .then(function (result) {
                        expect(result).toEqual(response);
                    })
                    .then(done)
                    .catch(done.fail);
            });
        });
    });
});
