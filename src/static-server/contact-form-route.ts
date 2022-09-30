import type { RouteOptions } from "fastify";

export function createContactFormRoute(): RouteOptions {
    return {
        method: "POST",
        url: "/contact-form",
        schema: {
            headers: {
                "content-type": { type: "string", const: "application/x-www-form-urlencoded" },
            },
            body: {},
            response: {
                200: {},
            },
        },
        async handler(_request, reply) {
            return reply.send({});
        },
    };
}
