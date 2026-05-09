import { describe, expect, it } from "vitest";
import { hackerNewsApiResponseSchema } from "./hacker-news-response-schema.js";

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

		expect(validatedPayload.hits?.[0]?.objectID).toBe("44000001");
	});

	it("rejects an invalid payload", () => {
		expect(() => {
			hackerNewsApiResponseSchema.assert({
				hits: [
					{
						objectID: 44000001
					}
				]
			});
		}).toThrow("hits[0].objectID must be a string");
	});
});
