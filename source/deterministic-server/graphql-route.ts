import type { Hono } from "hono";
import { validateGraphQlRequest } from "./request-validation.js";

const graphQlResponseBody = {
	data: {
		user: {
			repositories: { totalCount: 42 },
			starredRepositories: { totalCount: 101 }
		}
	}
};

const graphQlResponseHeaders = {
	"x-ratelimit-limit": "5000",
	"x-ratelimit-remaining": "4987",
	"x-ratelimit-reset": "1635919119",
	"x-ratelimit-resource": "graphql",
	"x-ratelimit-used": "13"
};

export function registerGraphQlRoute(application: Hono): void {
	application.post("/graphql", async (context) => {
		const requestValidationResult = await validateGraphQlRequest(context.req.raw);

		if (!requestValidationResult.isValid) {
			return context.json({ error: requestValidationResult.errorMessage }, 400);
		}

		return context.json(graphQlResponseBody, 200, graphQlResponseHeaders);
	});
}
