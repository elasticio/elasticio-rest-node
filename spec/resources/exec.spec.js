describe('/exec', function () {
    var client = require("../../lib/client")("root", "secret");
    var exec = client.exec;
    var nock = require('nock');

    describe('/schedule', function () {

        it('should send request successfully', function (done) {

            var input = {
                "execution_type": "get_meta_model",
                "action_or_trigger": "put",
                "component": "{CONNECTOR_ID}",
                "account_id": "{ACCOUNT_ID}"
            };

            var response = {
                "message": "ok"
            };

            nock('https://api.elastic.io')
                .post('/v1/exec/schedule', input)
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(202, response);

            var result;

            exec
                .schedule(input)
                .then(function (body) {
                    result = body;
                })
                .finally(function () {
                    expect(result).toEqual(response);

                    done();
                });

        });
    });

    describe('/poll', function () {

        it('should send request successfully', function (done) {

            var response = {
                "message": "Ready."
            };

            nock('https://api.elastic.io')
                .get('/v1/exec/poll/540492e623773659c5000002')
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(202, response);

            var result;

            exec
                .pollResult('540492e623773659c5000002')
                .then(function (body) {
                    result = body;
                })
                .finally(function () {
                    expect(result).toEqual(response);

                    done();
                });

        });
    });

    describe('/result', function () {

        it('should send request successfully', function (done) {

            var response = {
                "data": {
                    "some": "value"
                }
            };

            nock('https://api.elastic.io')
                .get('/v1/exec/result/540492e623773659c5000002')
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(202, response);

            var result;

            exec
                .retrieveResult('540492e623773659c5000002')
                .then(function (body) {
                    result = body;
                })
                .finally(function () {
                    expect(result).toEqual(response);

                    done();
                });

        });
    });
});
