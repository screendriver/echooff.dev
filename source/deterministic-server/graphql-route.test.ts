import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { registerGraphQlRoute } from "./graphql-route.js";

function createGraphQlTestApplication(): Hono {
	const application = new Hono();

	registerGraphQlRoute(application);

	return application;
}

describe("graphql route", () => {
	it("returns a user with a total count of repositories and starred repositories", async () => {
		const application = createGraphQlTestApplication();

		const response = await application.request("/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "vitest",
				"content-type": "application/json"
			},
			body: JSON.stringify({
				query: "{}"
			})
		});

		const actual: unknown = await response.json();
		const expected = {
			data: {
				user: {
					starredRepositories: { totalCount: 101 },
					repositories: { totalCount: 42 }
				}
			}
		};

		expect(actual).toStrictEqual(expected);
		expect(response.headers.get("x-ratelimit-limit")).toBe("5000");
		expect(response.headers.get("x-ratelimit-remaining")).toBe("4987");
		expect(response.headers.get("x-ratelimit-reset")).toBe("1635919119");
		expect(response.headers.get("x-ratelimit-resource")).toBe("graphql");
		expect(response.headers.get("x-ratelimit-used")).toBe("13");
	});

	it("rejects requests when the accept header is missing", async () => {
		const application = createGraphQlTestApplication();

		const response = await application.request("/graphql", {
			method: "POST",
			headers: {
				authorization: "token example",
				"user-agent": "vitest",
				"content-type": "application/json"
			},
			body: JSON.stringify({
				query: "{}"
			})
		});

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toStrictEqual({
			error: "The accept header must be application/vnd.github.v3+json."
		});
	});

	it("rejects requests when the query body field is missing", async () => {
		const application = createGraphQlTestApplication();

		const response = await application.request("/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "vitest",
				"content-type": "application/json"
			},
			body: JSON.stringify({})
		});

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toStrictEqual({
			error: "The request body must contain a query string."
		});
	});
});
