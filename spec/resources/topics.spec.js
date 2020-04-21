const nock = require('nock');
describe('/workspaces/:wsId/topics', () => {
    const user = 'root';
    const pass = 'secret';
    const client = require('../../lib/client')('root', 'secret');

    describe('GET /', () => {
        it('should return result as is', async done => {
            const wsId = '1234';
            const topics = [
                {
                    id: 'topic1',
                    type: 'topic',
                    attributes: {
                        name: 'Topic 1',
                        schema: {
                            type: 'string',
                            required: true
                        }
                    }
                },
                {
                    id: 'topic2',
                    type: 'topic',
                    attributes: {
                        name: 'Topic 2',
                        schema: {
                            type: 'object',
                            required: true,
                            properties: {
                                message: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                }
            ];
            nock('https://api.elastic.io')
                .get(`/v2/workspaces/${wsId}/topics/`)
                .basicAuth({ user, pass })
                .reply(200, { data: topics });

            try {
                const result = await client.topics.list(wsId);
                expect(result).toEqual({ data: topics });
                done();
            } catch (e) {
                done.fail(e);
            }
        });
        it('should throw error in case of non 200 response', async done => {
            const wsId = '1234';
            nock('https://api.elastic.io')
                .get(`/v2/workspaces/${wsId}/topics/`)
                .basicAuth({ user, pass })
                .reply(400, { errors: [{
                    code: 400,
                    title: 'Bad argument error',
                    detail: 'bad arguments send to request'
                }] });
            try {
                await client.topics.list(wsId);
                done.fail(new Error('error should be thrown'));
            } catch (e) {
                done();
            }
        });
    });
    describe('GET /:id', () => {
        it('should return result as is', async done => {
            const wsId = '1234';
            const topicId = '4321';
            const topic = {
                id: topicId,
                type: 'topic',
                attributes: {
                    name: 'Topic 1',
                    schema: {
                        type: 'string',
                        required: true
                    }
                }
            };
            nock('https://api.elastic.io')
                .get(`/v2/workspaces/${wsId}/topics/${topicId}`)
                .basicAuth({ user, pass })
                .reply(200, { data: topic });

            try {
                const result = await client.topics.getOne(wsId, topicId);
                expect(result).toEqual({ data: topic });
                done();
            } catch (e) {
                done.fail(e);
            }
        });
        it('should throw error in case of non 200 response', async done => {
            const wsId = '1234';
            const topicId = '4321';
            nock('https://api.elastic.io')
                .get(`/v2/workspaces/${wsId}/topics/${topicId}`)
                .basicAuth({ user, pass })
                .reply(404, { errors: [{
                    code: 404,
                    title: 'Not found',
                    detail: 'Topic not found'
                }] });
            try {
                await client.topics.getOne(wsId, topicId);
                done.fail(new Error('error should be thrown'));
            } catch (e) {
                done();
            }
        });
    });
});
