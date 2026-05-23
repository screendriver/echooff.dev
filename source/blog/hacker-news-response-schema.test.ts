import { describe, expect, it } from "vitest";
import { hackerNewsApiResponseSchema } from "./hacker-news-response-schema.ts";

describe("hacker news response schema", () => {
	it("accepts a valid payload", () => {
		const validatedPayload = hackerNewsApiResponseSchema.assert({
			hits: [
				{
					created_at: "2026-04-01T10:00:00.000Z",
					num_comments: 12,
					objectID: "44000001",
					points: 150,
					title: "Why I started this blog",
					url: "https://www.echooff.dev/blog/why-i-started-this-blog"
				}
			]
		});
		const actualObjectIdentifier = validatedPayload.hits?.[0]?.objectID;
		const expectedObjectIdentifier = "44000001";

		expect(actualObjectIdentifier).toBe(expectedObjectIdentifier);
	});

	it("rejects an invalid payload", () => {
		const actualAssertionOperation = (): void => {
			hackerNewsApiResponseSchema.assert({
				hits: [
					{
						objectID: 44_000_001
					}
				]
			});
		};
		const expectedErrorMessage = "hits[0].objectID must be a string";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});
});
