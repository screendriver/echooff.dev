import type { Hono } from "hono";
import { isErr } from "true-myth/result";
import { validateGraphQlRequest } from "./request-validation.ts";

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

		if (isErr(requestValidationResult)) {
			return context.json({ error: requestValidationResult.error.message }, 400);
		}

		return context.json(graphQlResponseBody, 200, graphQlResponseHeaders);
	});
}
