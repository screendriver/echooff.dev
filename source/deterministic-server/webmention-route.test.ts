import { describe, expect, it } from "vitest";
import { createDeterministicServerApplication } from "./deterministic-server.ts";

describe("webmention route", () => {
	it("returns a deterministic mentions payload", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request(
			"/webmentions?target=https://example.com/blog/why-i-started-this-blog"
		);
		const actualResponseBody: unknown = await response.json();
		const expectedResponseBody = {
			children: [
				{
					author: {
						name: "Jane Doe",
						photo: "http://localhost/webmention-avatar.svg",
						url: "https://social.example/@jane"
					},
					content: {
						text: "Thoughtful article."
					},
					published: "2026-03-24T10:00:00+00:00",
					url: "https://social.example/@jane/1",
					"wm-property": "in-reply-to"
				},
				{
					author: {
						name: "Chris"
					},
					published: "2026-03-25T08:30:00+00:00",
					url: "https://social.example/@chris/2",
					"wm-property": "mention-of"
				},
				{
					url: "https://social.example/@like/1",
					"wm-property": "like-of"
				},
				{
					url: "https://social.example/@bookmark/1",
					"wm-property": "bookmark-of"
				},
				{
					url: "https://social.example/@repost/1",
					"wm-property": "repost-of"
				}
			]
		};

		expect(actualResponseBody).toStrictEqual(expectedResponseBody);
	});

	it("returns a deterministic avatar asset", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request("/webmention-avatar.svg");
		const actualResponseBody = await response.text();
		const actualContentType = response.headers.get("content-type");
		const expectedContentType = "image/svg+xml; charset=utf-8";
		const expectedSvgMarker = "<svg";
		const expectedAccentColor = "#8BE9FD";

		expect(actualContentType).toBe(expectedContentType);
		expect(actualResponseBody).toContain(expectedSvgMarker);
		expect(actualResponseBody).toContain(expectedAccentColor);
	});
});
