import assert from "node:assert";
import { suite, test } from "mocha";
import { webmentionApiResponseSchema } from "./webmention-response-schema.ts";

suite("webmention response schema", function () {
	test("accepts a valid payload", function () {
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

		assert.strictEqual(actualAuthorName, expectedAuthorName);
	});

	test("rejects an invalid payload", function () {
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
		const expectedErrorMessage = "children[0].author.name must be a string (was a number)";

		assert.throws(actualAssertionOperation, { message: expectedErrorMessage });
	});
});
