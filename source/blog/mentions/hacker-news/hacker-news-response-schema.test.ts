import assert from "node:assert";
import { suite, test } from "mocha";
import { hackerNewsApiResponseSchema } from "./hacker-news-response-schema.ts";

suite("hacker news response schema", function () {
	test("accepts a valid payload", function () {
		const validatedPayload = hackerNewsApiResponseSchema.assert({
			hits: [
				{
					created_at: "2026-04-01T10:00:00.000Z",
					num_comments: 12,
					objectID: "44000001",
					points: 150,
					title: "Why I started this blog",
					url: "https://example.com/blog/why-i-started-this-blog"
				}
			]
		});
		const actualObjectIdentifier = validatedPayload.hits?.[0]?.objectID;
		const expectedObjectIdentifier = "44000001";

		assert.strictEqual(actualObjectIdentifier, expectedObjectIdentifier);
	});

	test("rejects an invalid payload", function () {
		const actualAssertionOperation = (): void => {
			hackerNewsApiResponseSchema.assert({
				hits: [
					{
						objectID: 44_000_001
					}
				]
			});
		};
		const expectedErrorMessage = "hits[0].objectID must be a string (was a number)";

		assert.throws(actualAssertionOperation, { message: expectedErrorMessage });
	});
});
