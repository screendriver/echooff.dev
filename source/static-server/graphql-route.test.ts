import { describe, it, expect } from "vitest";
import createFastify from "fastify";
import { createGraphQlRoute } from "./graphql-route.js";

describe("graphql route", () => {
	it("returns an user with a total count of repositories and starred repositories", async () => {
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

		expect(actual).toStrictEqual(expected);
	});
});
