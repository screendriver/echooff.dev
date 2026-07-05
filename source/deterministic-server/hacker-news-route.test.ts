import assert from "node:assert";
import { suite, test } from "mocha";
import { createDeterministicServerApplication } from "./deterministic-server.ts";

suite("hacker news route", function () {
	test("returns a deterministic mentions payload", async function () {
		const application = createDeterministicServerApplication();

		const response = await application.request(
			"/hacker-news?query=https://example.com/blog/why-i-started-this-blog"
		);
		const actualResponseBody: unknown = await response.json();
		const expectedResponseBody = {
			hits: [
				{
					created_at: "2026-04-02T10:00:00.000Z",
					num_comments: 42,
					objectID: "44000002",
					points: 128,
					title: "Why I started this blog",
					url: "https://example.com/blog/why-i-started-this-blog"
				}
			]
		};

		assert.deepStrictEqual(actualResponseBody, expectedResponseBody);
	});
});
