import type { RouteOptions } from "fastify";

export function createGraphQlRoute(): RouteOptions {
	return {
		method: "POST",
		url: "/graphql",
		schema: {
			headers: {
				type: "object",
				properties: {
					accept: { type: "string", const: "application/vnd.github.v3+json" },
					authorization: { type: "string" },
					"user-agent": { type: "string" },
				},
			},
			body: {
				type: "object",
				properties: {
					query: { type: "string" },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						data: {
							type: "object",
							properties: {
								user: {
									type: "object",
									properties: {
										repositories: {
											type: "object",
											properties: {
												totalCount: { type: "number" },
											},
										},
										starredRepositories: {
											type: "object",
											properties: {
												totalCount: { type: "number" },
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
		async handler(_request, reply) {
			return reply
				.headers({
					"x-ratelimit-limit": 5000,
					"x-ratelimit-remaining": 4987,
					"x-ratelimit-reset": 1635919119,
					"x-ratelimit-resource": "graphql",
					"x-ratelimit-used": 13,
				})
				.send({
					data: {
						user: {
							repositories: { totalCount: 42 },
							starredRepositories: { totalCount: 101 },
						},
					},
				});
		},
	};
}
