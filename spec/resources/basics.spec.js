describe('Basic use cases', function () {
    var nock = require('nock');

    afterEach(function (done) {
        delete process.env.ELASTICIO_API_USERNAME;
        delete process.env.ELASTICIO_API_KEY;
        delete process.env.ELASTICIO_API_URI;

        done();
    });


    it('should authenticate with env vars', function (done) {
        process.env.ELASTICIO_API_USERNAME = '_username_from_env_var';
        process.env.ELASTICIO_API_KEY = '_apikey_from_env_var';

        var client = require('../../lib/client')();

        var response = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@example.com',
            'password': 'secret',
            'company': 'Doe & Partners'
        };

        nock('https://api.elastic.io')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .basicAuth({
                user: '_username_from_env_var',
                pass: '_apikey_from_env_var'
            })
            .reply(200, response);

        var result;

        client
            .users
            .me()
            .then(function (body) {
                result = body;
            })
            .finally(function () {
                expect(result).toEqual(response);

                done();
            });
    });

    it('should use API uri from env vars', function (done) {

        process.env.ELASTICIO_API_URI = 'https://api.elastic-staging-server.com';

        var client = require('../../lib/client')('root', 'secret');


        var response = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@example.com',
            'password': 'secret',
            'company': 'Doe & Partners'
        };

        nock('https://api.elastic-staging-server.com')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .basicAuth({
                user: 'root',
                pass: 'secret'
            })
            .reply(200, response);

        var result;

        client
            .users
            .me()
            .then(function (body) {
                result = body;
            })
            .finally(function () {
                expect(result).toEqual(response);

                done();
            });

    });

    it('should strip ending / from API uri coming from env vars', function (done) {

        process.env.ELASTICIO_API_URI = 'https://api.elastic-staging-server.com/////';

        var client = require('../../lib/client')('root', 'secret');


        var response = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@example.com',
            'password': 'secret',
            'company': 'Doe & Partners'
        };

        nock('https://api.elastic-staging-server.com')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .basicAuth({
                user: 'root',
                pass: 'secret'
            })
            .reply(200, response);

        var result;

        client
            .users
            .me()
            .then(function (body) {
                result = body;
            })
            .finally(function () {
                expect(result).toEqual(response);

                done();
            });

    });

    it('should send request successfully', function (done) {
        var client = require('../../lib/client')('root', 'secret');

        var result;

        client
            .users
            .delete()
            .catch(function (e) {
                result = e;
            })
            .finally(function () {
                expect(result.message).toEqual(`Missing value for parameter '{id}'. Please provide argument: 0`);

                done();
            });

    });

    it('should handle status codes properly', function (done) {

        var client = require('../../lib/client')('root', 'secret');

        var response = {
            'error': 'Invalid username or secret provided.'
        };

        nock('https://api.elastic.io')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .reply(401, response);

        var result;
        var error;

        client
            .users
            .me()
            .then(function (body) {
                result = body;
            })
            .catch(function (e) {
                error = e;
            })
            .finally(function () {
                expect(result).toBeUndefined();
                expect(error).toBeDefined();
                expect(error?.message).toEqual('{"error":"Invalid username or secret provided."}');
                expect(error.statusCode).toEqual(401);

                done();
            });

    });

    it('should handle string response properly', function (done) {

        var client = require('../../lib/client')('root', 'secret');

        nock('https://api.elastic.io')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .reply(401, 'Invalid username or secret provided.');

        var result;
        var error;

        client
            .users
            .me()
            .then(function (body) {
                result = body;
            })
            .catch(function (e) {
                error = e;
            })
            .finally(function () {
                expect(result).toBeUndefined();
                expect(error).toBeDefined();
                expect(error.message).toEqual('Invalid username or secret provided.');
                expect(error.statusCode).toEqual(401);

                done();
            });

    });

    it('should retry on network error and fail after 3 fails by default', done => {
        const client = require('../../lib/client')('root', 'secret');

        nock('https://api.elastic.io')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .times(3)
            .replyWithError({code: 'ECONNRESET'});

        client
            .users
            .me()
            .then(() => done.fail(new Error('Should fail')))
            .catch(error => {
                expect(error).toBeDefined();
                expect(error.code).toEqual('ECONNRESET');

                done();
            });
    });

    it('should retry on >= 500 error and fail after 3 fails by default', done => {
        const client = require('../../lib/client')('root', 'secret');

        nock('https://api.elastic.io')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .times(3)
            .reply(500, 'Invalid username or secret provided.');

        client
            .users
            .me()
            .then(() => done.fail(new Error('Should fail')))
            .catch(error => {
                expect(error).toBeDefined();
                expect(error.message).toEqual('Invalid username or secret provided.');
                expect(error.statusCode).toEqual(500);

                done();
            });
    });

    it('should retry on network error and fail after 3 fails by default', done => {
        const client = require('../../lib/client')('root', 'secret');

        nock('https://api.elastic.io')
            .matchHeader('Connection', 'Keep-Alive')
            .get('/v1/users/')
            .times(3)
            .replyWithError({code: 'ECONNRESET'});

        client
            .users
            .me()
            .then(() => done.fail(new Error('Should fail')))
            .catch(error => {
                expect(error).toBeDefined();
                expect(error.code).toEqual('ECONNRESET');

                done();
            });
    });
});
