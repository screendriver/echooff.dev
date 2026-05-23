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
		const actualAuthorName = validatedPayload.children?.[0]?.author?.name;
		const expectedAuthorName = "Jane Doe";

		expect(actualAuthorName).toBe(expectedAuthorName);
	});

	it("rejects an invalid payload", () => {
		const actualAssertionOperation = (): void => {
			webmentionApiResponseSchema.assert({
				children: [
					{
						author: {
							name: 42
						}
					}
				]
			});
		};
		const expectedErrorMessage = "children[0].author.name must be a string";

		expect(actualAssertionOperation).toThrow(expectedErrorMessage);
	});
});
