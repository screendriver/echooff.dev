import assert from 'assert';
import createFastify from 'fastify';
import { createGraphQlRoute } from '../../../src/static-server/graphql-route';

suite('graphql-route', function () {
  test('returns an user with a total count of repositories and starred repositories', async function () {
    const fastify = createFastify();
    fastify.route(createGraphQlRoute());

    const response = await fastify.inject({
      method: 'POST',
      url: '/graphql',
      payload: {
        query: '{}',
      },
    });

    const actual = response.json<unknown>();
    const expected = {
      data: {
        user: {
          starredRepositories: { totalCount: 736 },
          repositories: { totalCount: 66 },
        },
      },
    };
    assert.deepStrictEqual(actual, expected);
  });
});
