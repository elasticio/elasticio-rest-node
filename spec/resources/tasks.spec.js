describe('/tasks', function () {
    var client = require("../../lib/client")("root", "secret");
    var tasks = client.tasks;
    var nock = require('nock');

    describe('/start/{id}', function () {

        it('should send request successfully', function (done) {

            var response = {
                "id": "5602c23e6459bd0500000001",
                "status": "active"
            };

            nock('https://api.elastic.io')
                .post('/v1/tasks/start/5602c23e6459bd0500000001')
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(200, response);

            var result;

            tasks
                .start("5602c23e6459bd0500000001")
                .then(function (body) {
                    result = body;
                })
                .finally(function () {
                    expect(result).toEqual(response);

                    done();
                });

        });
    });

    describe('/stop/{id}', function () {

        it('should send request successfully', function (done) {

            var response = {
                "id": "5602c23e6459bd0500000001",
                "status": "inactive"
            };

            nock('https://api.elastic.io')
                .post('/v1/tasks/stop/5602c23e6459bd0500000001')
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(200, response);

            var result;

            tasks
                .stop("5602c23e6459bd0500000001")
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
