import createFastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyFormBody from 'fastify-formbody';
import { createContactFormRoute } from './static-server/contact-form-route';
import { createGraphQlRoute } from './static-server/graphql-route';

const fastify = createFastify({
    logger: true,
});

void fastify.register(fastifyCors);
void fastify.register(fastifyFormBody);

fastify.route(createGraphQlRoute());
fastify.route(createContactFormRoute());

async function start() {
    await fastify.listen(3000);
}

function crash(error: unknown) {
    fastify.log.error(error);
    process.exitCode = 1;
}

start().catch(crash);
