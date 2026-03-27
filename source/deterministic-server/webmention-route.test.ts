import { describe, expect, it } from "vitest";
import { createDeterministicServerApplication } from "./deterministic-server.js";

describe("webmention route", () => {
	it("returns a deterministic mentions payload", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request(
			"/webmentions?target=https://www.echooff.dev/blog/why-i-started-this-blog"
		);
		const actual: unknown = await response.json();
		const expected = {
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

		expect(actual).toStrictEqual(expected);
	});

	it("returns a deterministic avatar asset", async () => {
		const application = createDeterministicServerApplication();

		const response = await application.request("/webmention-avatar.svg");
		const body = await response.text();

		expect(response.headers.get("content-type")).toBe("image/svg+xml");
		expect(body).toContain("<svg");
		expect(body).toContain("#8BE9FD");
	});
});
