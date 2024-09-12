describe('/tasks', function() {
    var client = require("../../lib/client")("root", "secret");
    var taskhooksdata = client.taskhooksdata;
    var nock = require('nock');

    describe('/create', function() {
        it('should send POST request for corresponding URL', function(done) {

            var input = {
                a: 1,
                b: 'v_2',
                c: [1, 2],
                d: {
                    e: null,
                    g: ['a', 'b']
                }
            };

            var taskId = '5602c23e6459bd0500000002';
            var response = {};

            nock('https://api.elastic.io')
                .post('/v1/sailor-support/hooks/task/5602c23e6459bd0500000002/startup/data', input)
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(200, response);

            taskhooksdata
                .create(taskId, input)
                .then(done)
                .catch(done.fail)
        });
    });

    describe('/delete', function() {
        it('should send DELETE request for corresponding URL', function(done) {

            var taskId = '5602c23e6459bd0500000003';

            nock('https://api.elastic.io')
                .delete('/v1/sailor-support/hooks/task/5602c23e6459bd0500000003/startup/data')
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(204);

            taskhooksdata
                .delete(taskId)
                .then(done)
                .catch(done.fail)
        });
    });

    describe('/retrieve', function() {
        it('should send GET request for corresponding URL', function(done) {

            var taskId = '5602c23e6459bd0500000003';

            nock('https://api.elastic.io')
                .get('/v1/sailor-support/hooks/task/5602c23e6459bd0500000003/startup/data')
                .basicAuth({
                    user: 'root',
                    pass: 'secret'
                })
                .reply(200, { a: 3 });

            taskhooksdata
                .retrieve(taskId)
                .then(done)
                .catch(done.fail)
        });
    });
});
