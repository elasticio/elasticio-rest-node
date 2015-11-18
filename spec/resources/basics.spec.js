describe('Basic use cases', function () {
    var client = require("../../lib/client")("root", "secret");
    var users = client.users;
    var nock = require('nock');

    it('should send request successfully', function (done) {

        var result;

        users
            .delete()
            .fail(function (e) {
                result = e;
            })
            .finally(function () {
                expect(result.message).toEqual("Missing value for parameter '{id}'. Please provide argument: 0");

                done();
            });

    });

    it('should handle status codes properly', function (done) {

        var response = {
            "error":"Invalid username or secret provided."
        };

        nock('https://api.elastic.io')
            .get('/v1/users/')
            .reply(401, response);

        var result;
        var error;

        users
            .me()
            .then(function (body) {
                result = body;
            })
            .fail(function(e){
                error = e;
            })
            .finally(function () {
                expect(result).toBeUndefined();
                expect(error).toBeDefined();
                expect(error.message).toEqual('{"error":"Invalid username or secret provided."}');

                done();
            });

    });
});
