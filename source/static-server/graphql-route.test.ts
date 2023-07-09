import test from "ava";
import createFastify from "fastify";
import { createGraphQlRoute } from "./graphql-route.js";

test("returns an user with a total count of repositories and starred repositories", async (t) => {
	const fastify = createFastify();
	fastify.route(createGraphQlRoute());

	const response = await fastify.inject({
		method: "POST",
		url: "/graphql",
		payload: {
			query: "{}",
		},
	});

	const actual = response.json<unknown>();
	const expected = {
		data: {
			user: {
				starredRepositories: { totalCount: 101 },
				repositories: { totalCount: 42 },
			},
		},
	};

	t.deepEqual(actual, expected);
});
