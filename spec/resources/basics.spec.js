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
});
