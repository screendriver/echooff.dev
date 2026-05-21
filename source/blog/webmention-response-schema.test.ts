import { describe, expect, it } from "vitest";
import { webmentionApiResponseSchema } from "./webmention-response-schema.ts";

describe("webmention response schema", () => {
	it("accepts a valid payload", () => {
		const validatedPayload = webmentionApiResponseSchema.assert({
			children: [
				{
					author: {
						name: "Jane Doe",
						photo: "https://social.example/jane.jpg",
						url: "https://social.example/@jane"
					},
					content: {
						summary: "Short summary"
					},
					published: "2026-03-24T10:00:00+00:00",
					url: "https://social.example/@jane/1",
					"wm-property": "mention-of"
				}
			]
		});

		expect(validatedPayload.children?.[0]?.author?.name).toBe("Jane Doe");
	});

	it("rejects an invalid payload", () => {
		expect(() => {
			webmentionApiResponseSchema.assert({
				children: [
					{
						author: {
							name: 42
						}
					}
				]
			});
		}).toThrow("children[0].author.name must be a string");
	});
});
