import { test, assert } from "vitest";
import createFastify from "fastify";
import { createGraphQlRoute } from "../../../src/static-server/graphql-route";

test("returns an user with a total count of repositories and starred repositories", async () => {
	const fastify = createFastify();
	fastify.route(createGraphQlRoute());

	const response = await fastify.inject({
		method: "POST",
		url: "/graphql",
		payload: {
			query: "{}"
		}
	});

	const actual = response.json<unknown>();
	const expected = {
		data: {
			user: {
				starredRepositories: { totalCount: 101 },
				repositories: { totalCount: 42 }
			}
		}
	};
	assert.deepEqual(actual, expected);
});
