import { describe, expect, it, vi } from "vitest";
import { Maybe } from "true-myth";
import {
	createEmptyWebmentionSectionModel,
	createWebmentionApiRequestUrl,
	loadWebmentionsForTargetUrl,
	parseWebmentionApiResponse
} from "./webmentions.js";

describe("createEmptyWebmentionSectionModel()", () => {
	it("creates an empty section model", () => {
		expect(createEmptyWebmentionSectionModel()).toStrictEqual({
			reactions: {
				bookmarkCount: 0,
				likeCount: 0,
				repostCount: 0
			},
			replies: []
		});
	});
});

describe("createWebmentionApiRequestUrl()", () => {
	it("creates the API request URL for a target URL", () => {
		expect(
			createWebmentionApiRequestUrl({
				targetUrl: "https://www.echooff.dev/blog/why-i-started-this-blog",
				webmentionApiUrl: new URL("https://webmention.io/api/mentions.jf2")
			})
		).toBe(
			"https://webmention.io/api/mentions.jf2?per-page=100&target=https%3A%2F%2Fwww.echooff.dev%2Fblog%2Fwhy-i-started-this-blog"
		);
	});
});

describe("parseWebmentionApiResponse()", () => {
	it("groups public reactions and replies while filtering invalid entries", () => {
		const sectionModel = parseWebmentionApiResponse({
			children: [
				{
					author: {
						name: "Jane Doe",
						photo: "https://social.example/jane.jpg",
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
				},
				{
					url: "https://social.example/@private/1",
					"wm-private": true,
					"wm-property": "like-of"
				},
				{
					url: "/relative-path",
					"wm-property": "like-of"
				},
				{
					"wm-property": "in-reply-to"
				}
			]
		});

		expect(sectionModel).toStrictEqual({
			reactions: {
				bookmarkCount: 1,
				likeCount: 1,
				repostCount: 1
			},
			replies: [
				{
					author: {
						name: "Chris",
						photoUrl: Maybe.nothing(),
						websiteUrl: Maybe.nothing()
					},
					content: Maybe.nothing(),
					sourceUrl: "https://social.example/@chris/2",
					type: "mention",
					visiblePublishedAt: Maybe.just("2026-03-25T08:30:00+00:00")
				},
				{
					author: {
						name: "Jane Doe",
						photoUrl: Maybe.just("https://social.example/jane.jpg"),
						websiteUrl: Maybe.just("https://social.example/@jane")
					},
					content: Maybe.just("Thoughtful article."),
					sourceUrl: "https://social.example/@jane/1",
					type: "reply",
					visiblePublishedAt: Maybe.just("2026-03-24T10:00:00+00:00")
				}
			]
		});
	});

	it("falls back to the received date and source hostname when the payload omits them", () => {
		const sectionModel = parseWebmentionApiResponse({
			children: [
				{
					"wm-received": "2026-03-26T09:45:00+00:00",
					url: "https://remote.example/post/1",
					"wm-property": "mention-of"
				}
			]
		});

		expect(sectionModel.replies).toStrictEqual([
			{
				author: {
					name: "remote.example",
					photoUrl: Maybe.nothing(),
					websiteUrl: Maybe.nothing()
				},
				content: Maybe.nothing(),
				sourceUrl: "https://remote.example/post/1",
				type: "mention",
				visiblePublishedAt: Maybe.just("2026-03-26T09:45:00+00:00")
			}
		]);
	});

	it("prefers summarized content over the full text content", () => {
		const sectionModel = parseWebmentionApiResponse({
			children: [
				{
					content: {
						summary: "Short summary",
						text: "This is the longer body that should not be preferred."
					},
					url: "https://remote.example/post/1",
					"wm-property": "mention-of"
				}
			]
		});

		expect(sectionModel.replies[0]?.content).toStrictEqual(Maybe.just("Short summary"));
	});

	it("truncates long rendered content", () => {
		const sectionModel = parseWebmentionApiResponse({
			children: [
				{
					content: {
						text: "A".repeat(400)
					},
					url: "https://remote.example/post/1",
					"wm-property": "mention-of"
				}
			]
		});
		const renderedContent = sectionModel.replies[0]?.content.unwrapOr("");

		expect(renderedContent).toHaveLength(280);
		expect((renderedContent ?? "").endsWith("…")).toBe(true);
	});
});

describe("loadWebmentionsForTargetUrl()", () => {
	it("fetches the parsed section model for the target URL", async () => {
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: true,
			json: async () => {
				return {
					children: [
						{
							url: "https://social.example/@jane/1",
							"wm-property": "like-of"
						}
					]
				};
			},
			status: 200
		} as Response);

		const sectionModel = await loadWebmentionsForTargetUrl(
			{
				fetch: fetchImplementation
			},
			"https://www.echooff.dev/blog/why-i-started-this-blog"
		);

		expect(fetchImplementation).toHaveBeenCalledWith(
			"https://webmention.io/api/mentions.jf2?per-page=100&target=https%3A%2F%2Fwww.echooff.dev%2Fblog%2Fwhy-i-started-this-blog"
		);
		expect(sectionModel.reactions.likeCount).toBe(1);
	});

	it("throws when the API request fails", async () => {
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: false,
			json: async () => {
				return {};
			},
			status: 503
		} as Response);

		await expect(async () => {
			return loadWebmentionsForTargetUrl(
				{
					fetch: fetchImplementation
				},
				"https://www.echooff.dev/blog/why-i-started-this-blog"
			);
		}).rejects.toThrow("Webmention API request failed with status 503");
	});
});
