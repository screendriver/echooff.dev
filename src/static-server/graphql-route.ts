import { RouteOptions } from 'fastify';

export function createGraphQlRoute(): RouteOptions {
  return {
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
  };
}
