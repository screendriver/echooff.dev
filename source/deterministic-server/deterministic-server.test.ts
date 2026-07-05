import assert from "node:assert";
import { suite, test } from "mocha";
import { createDeterministicServerApplication } from "./deterministic-server.ts";

suite("createDeterministicServerApplication()", function () {
	test("registers the GraphQL route", async function () {
		const application = createDeterministicServerApplication();

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
		const actualResponseStatus = response.status;
		const actualResponseBody: unknown = await response.json();
		const expectedResponseStatus = 200;
		const expectedResponseBody = {
			data: {
				user: {
					starredRepositories: { totalCount: 101 },
					repositories: { totalCount: 42 }
				}
			}
		};

		assert.strictEqual(actualResponseStatus, expectedResponseStatus);
		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
	});

	test("registers the development API routes", async function () {
		const application = createDeterministicServerApplication();
		const contactFormBody = new URLSearchParams({
			message: "hello"
		});

		const hackerNewsResponse = await application.request("/hacker-news?query=https%3A%2F%2Fexample.com%2Fpost");
		const contactFormResponse = await application.request("/contact-form", {
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded"
			},
			body: contactFormBody.toString()
		});
		const webmentionResponse = await application.request("http://127.0.0.1/webmentions");
		const actualHackerNewsResponseStatus = hackerNewsResponse.status;
		const actualContactFormResponseStatus = contactFormResponse.status;
		const actualWebmentionResponseStatus = webmentionResponse.status;
		const expectedResponseStatus = 200;

		assert.strictEqual(actualHackerNewsResponseStatus, expectedResponseStatus);
		assert.strictEqual(actualContactFormResponseStatus, expectedResponseStatus);
		assert.strictEqual(actualWebmentionResponseStatus, expectedResponseStatus);
	});

	test("serves the deterministic webmention avatar as SVG", async function () {
		const application = createDeterministicServerApplication();

		const response = await application.request("/webmention-avatar.svg");
		const actualResponseStatus = response.status;
		const actualContentTypeHeader = response.headers.get("content-type");
		const actualResponseBody = await response.text();
		const expectedResponseStatus = 200;
		const expectedContentTypeHeader = "image/svg+xml; charset=utf-8";

		assert.strictEqual(actualResponseStatus, expectedResponseStatus);
		assert.strictEqual(actualContentTypeHeader, expectedContentTypeHeader);
		assert.ok(actualResponseBody.includes("<svg"));
	});

	test("applies CORS headers", async function () {
		const application = createDeterministicServerApplication();

		const response = await application.request("/hacker-news", {
			headers: {
				origin: "https://example.com"
			}
		});
		const actualCorsHeader = response.headers.get("access-control-allow-origin");
		const expectedCorsHeader = "*";

		assert.strictEqual(actualCorsHeader, expectedCorsHeader);
	});
});
