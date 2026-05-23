import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { registerGraphQlRoute } from "./graphql-route.ts";

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

		const actualResponseBody: unknown = await response.json();
		const expectedResponseBody = {
			data: {
				user: {
					starredRepositories: { totalCount: 101 },
					repositories: { totalCount: 42 }
				}
			}
		};
		const actualRateLimitHeader = response.headers.get("x-ratelimit-limit");
		const expectedRateLimitHeader = "5000";
		const actualRemainingHeader = response.headers.get("x-ratelimit-remaining");
		const expectedRemainingHeader = "4987";
		const actualResetHeader = response.headers.get("x-ratelimit-reset");
		const expectedResetHeader = "1635919119";
		const actualResourceHeader = response.headers.get("x-ratelimit-resource");
		const expectedResourceHeader = "graphql";
		const actualUsedHeader = response.headers.get("x-ratelimit-used");
		const expectedUsedHeader = "13";

		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
		expect(actualRateLimitHeader).toBe(expectedRateLimitHeader);
		expect(actualRemainingHeader).toBe(expectedRemainingHeader);
		expect(actualResetHeader).toBe(expectedResetHeader);
		expect(actualResourceHeader).toBe(expectedResourceHeader);
		expect(actualUsedHeader).toBe(expectedUsedHeader);
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
		const actualResponseStatus = response.status;
		const actualResponseBody: unknown = await response.json();
		const expectedResponseStatus = 400;
		const expectedResponseBody = {
			error: "The accept header must be application/vnd.github.v3+json."
		};

		expect(actualResponseStatus).toBe(expectedResponseStatus);
		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
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
		const actualResponseStatus = response.status;
		const actualResponseBody: unknown = await response.json();
		const expectedResponseStatus = 400;
		const expectedResponseBody = {
			error: "The request body must contain a query string."
		};

		expect(actualResponseStatus).toBe(expectedResponseStatus);
		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
	});
});
