import createFastify from 'fastify';
import fastifyCors from 'fastify-cors';

const fastify = createFastify({
  logger: true,
});

void fastify.register(fastifyCors);

fastify.route({
  method: 'POST',
  url: '/graphql',
  schema: {
    headers: {
      accept: { type: 'string', const: 'application/vnd.github.v3+json' },
      authorization: { type: 'string' },
      'user-agent': { type: 'string' },
    },
    body: {
      query: { type: 'string' },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  starredRepositories: {
                    type: 'object',
                    properties: {
                      totalCount: { type: 'number' },
                    },
                  },
                  repositories: {
                    type: 'object',
                    properties: {
                      totalCount: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  handler: async (_request, reply) => {
    return reply
      .headers({
        'x-ratelimit-limit': 5000,
        'x-ratelimit-remaining': 4987,
        'x-ratelimit-reset': 1635919119,
        'x-ratelimit-resource': 'graphql',
        'x-ratelimit-used': 13,
      })
      .send({
        data: {
          user: {
            starredRepositories: { totalCount: 736 },
            repositories: { totalCount: 66 },
          },
        },
      });
  },
});

async function start() {
  await fastify.listen(3000);
}

function crash(error: unknown) {
  fastify.log.error(error);
  process.exitCode = 1;
}

start().catch(crash);
