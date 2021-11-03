import createFastify from 'fastify';
import fastifyCors from 'fastify-cors';
import { createGraphQlRoute } from './static-server/graphql-route';

const fastify = createFastify({
  logger: true,
});

void fastify.register(fastifyCors);

fastify.route(createGraphQlRoute());

async function start() {
  await fastify.listen(3000);
}

function crash(error: unknown) {
  fastify.log.error(error);
  process.exitCode = 1;
}

start().catch(crash);
