import assert from "node:assert";
import { suite, test } from "mocha";
import { Hono } from "hono";
import { registerGraphQlRoute } from "./graphql-route.ts";

function createGraphQlTestApplication(): Hono {
	const application = new Hono();

	registerGraphQlRoute(application);

	return application;
}

suite("graphql route", function () {
	test("returns a user with a total count of repositories and starred repositories", async function () {
		const application = createGraphQlTestApplication();

		const response = await application.request("/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "mocha",
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

		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
		assert.strictEqual(actualRateLimitHeader, expectedRateLimitHeader);
		assert.strictEqual(actualRemainingHeader, expectedRemainingHeader);
		assert.strictEqual(actualResetHeader, expectedResetHeader);
		assert.strictEqual(actualResourceHeader, expectedResourceHeader);
		assert.strictEqual(actualUsedHeader, expectedUsedHeader);
	});

	test("rejects requests when the accept header is missing", async function () {
		const application = createGraphQlTestApplication();

		const response = await application.request("/graphql", {
			method: "POST",
			headers: {
				authorization: "token example",
				"user-agent": "mocha",
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

		assert.strictEqual(actualResponseStatus, expectedResponseStatus);
		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
	});

	test("rejects requests when the query body field is missing", async function () {
		const application = createGraphQlTestApplication();

		const response = await application.request("/graphql", {
			method: "POST",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: "token example",
				"user-agent": "mocha",
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

		assert.strictEqual(actualResponseStatus, expectedResponseStatus);
		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
	});
});
