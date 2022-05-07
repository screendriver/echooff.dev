import getPort from 'get-port';
import createFastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import { createContactFormRoute } from './contact-form-route';
import { createGraphQlRoute } from './graphql-route';

export async function startStaticServer(): Promise<string> {
    const fastify = createFastify();

    try {
        await fastify.register(fastifyCors);
        await fastify.register(fastifyFormBody);

        fastify.route(createGraphQlRoute());
        fastify.route(createContactFormRoute());

        const availablePort = await getPort();
        const listeningAddress = await fastify.listen(availablePort);

        return listeningAddress;
    } catch (error: unknown) {
        fastify.log.error(error);
        throw error;
    }
}
