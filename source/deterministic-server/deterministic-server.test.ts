import { describe, expect, it } from "vitest";
import { createDeterministicServerApplication } from "./deterministic-server.ts";

describe("createDeterministicServerApplication()", () => {
	it("registers the GraphQL route", async () => {
		const application = createDeterministicServerApplication();

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

		expect(actualResponseStatus).toBe(expectedResponseStatus);
		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
	});

	it("registers the development API routes", async () => {
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

		expect(actualHackerNewsResponseStatus).toBe(expectedResponseStatus);
		expect(actualContactFormResponseStatus).toBe(expectedResponseStatus);
		expect(actualWebmentionResponseStatus).toBe(expectedResponseStatus);
	});

	it("serves the deterministic webmention avatar as SVG", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request("/webmention-avatar.svg");
		const actualResponseStatus = response.status;
		const actualContentTypeHeader = response.headers.get("content-type");
		const actualResponseBody = await response.text();
		const expectedResponseStatus = 200;
		const expectedContentTypeHeader = "image/svg+xml; charset=utf-8";

		expect(actualResponseStatus).toBe(expectedResponseStatus);
		expect(actualContentTypeHeader).toBe(expectedContentTypeHeader);
		expect(actualResponseBody).toContain("<svg");
	});

	it("applies CORS headers", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request("/hacker-news", {
			headers: {
				origin: "https://www.echooff.dev"
			}
		});
		const actualCorsHeader = response.headers.get("access-control-allow-origin");
		const expectedCorsHeader = "*";

		expect(actualCorsHeader).toBe(expectedCorsHeader);
	});
});
