import type { RouteOptions } from "fastify";

export function createContactFormRoute(): RouteOptions {
	return {
		method: "POST",
		url: "/contact-form",
		schema: {
			headers: {
				type: "object",
				properties: {
					"content-type": { type: "string", const: "application/x-www-form-urlencoded" },
				},
			},
			body: {
				type: "object",
				properties: {},
			},
			response: {
				200: {
					type: "object",
					properties: {},
				},
			},
		},
		async handler(_request, reply) {
			return reply.send({});
		},
	};
}
