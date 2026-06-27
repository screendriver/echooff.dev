import { describe, expect, it, vi } from "vitest";
import { just, nothing } from "true-myth/maybe";
import {
	createEmptyWebmentionSectionModel,
	createWebmentionApiRequestUrl,
	loadWebmentionsForTargetUrl,
	parseWebmentionApiResponse
} from "./webmentions.ts";

describe("createEmptyWebmentionSectionModel()", () => {
	it("creates an empty section model", () => {
		const actualSectionModel = createEmptyWebmentionSectionModel();
		const expectedSectionModel = {
			reactions: {
				bookmarkCount: 0,
				likeCount: 0,
				repostCount: 0
			},
			replies: []
		};

		expect(actualSectionModel).toStrictEqual(expectedSectionModel);
	});
});

describe("createWebmentionApiRequestUrl()", () => {
	it("creates the API request URL for a target URL", () => {
		const actualRequestUrl = createWebmentionApiRequestUrl({
			targetUrl: "https://www.echooff.dev/blog/why-i-started-this-blog",
			webmentionApiUrl: new URL("https://webmention.io/api/mentions.jf2")
		});
		const expectedRequestUrl =
			"https://webmention.io/api/mentions.jf2?per-page=100&target=https%3A%2F%2Fwww.echooff.dev%2Fblog%2Fwhy-i-started-this-blog";

		expect(actualRequestUrl).toBe(expectedRequestUrl);
	});
});

describe("parseWebmentionApiResponse()", () => {
	it("groups public reactions and replies while filtering invalid entries", () => {
		const actualSectionModel = parseWebmentionApiResponse({
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

		const expectedSectionModel = {
			reactions: {
				bookmarkCount: 1,
				likeCount: 1,
				repostCount: 1
			},
			replies: [
				{
					author: {
						name: "Chris",
						photoUrl: nothing(),
						websiteUrl: nothing()
					},
					content: nothing(),
					sourceUrl: "https://social.example/@chris/2",
					type: "mention",
					visiblePublishedAt: just("2026-03-25T08:30:00+00:00")
				},
				{
					author: {
						name: "Jane Doe",
						photoUrl: just("https://social.example/jane.jpg"),
						websiteUrl: just("https://social.example/@jane")
					},
					content: just("Thoughtful article."),
					sourceUrl: "https://social.example/@jane/1",
					type: "reply",
					visiblePublishedAt: just("2026-03-24T10:00:00+00:00")
				}
			]
		};

		expect(actualSectionModel).toStrictEqual(expectedSectionModel);
	});

	it("falls back to the received date and source hostname when the payload omits them", () => {
		const actualSectionModel = parseWebmentionApiResponse({
			children: [
				{
					"wm-received": "2026-03-26T09:45:00+00:00",
					url: "https://remote.example/post/1",
					"wm-property": "mention-of"
				}
			]
		});

		const actualReplies = actualSectionModel.replies;
		const expectedReplies = [
			{
				author: {
					name: "remote.example",
					photoUrl: nothing(),
					websiteUrl: nothing()
				},
				content: nothing(),
				sourceUrl: "https://remote.example/post/1",
				type: "mention",
				visiblePublishedAt: just("2026-03-26T09:45:00+00:00")
			}
		];

		expect(actualReplies).toStrictEqual(expectedReplies);
	});

	it("prefers summarized content over the full text content", () => {
		const actualSectionModel = parseWebmentionApiResponse({
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

		const actualContent = actualSectionModel.replies[0]?.content;
		const expectedContent = just("Short summary");

		expect(actualContent).toStrictEqual(expectedContent);
	});

	it("truncates long rendered content", () => {
		const actualSectionModel = parseWebmentionApiResponse({
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
		const actualRenderedContent = actualSectionModel.replies[0]?.content.unwrapOr("") ?? "";
		const actualRenderedContentLength = actualRenderedContent.length;
		const expectedRenderedContentLength = 280;
		const actualEndsWithEllipsis = actualRenderedContent.endsWith("…");
		const expectedEndsWithEllipsis = true;

		expect(actualRenderedContentLength).toBe(expectedRenderedContentLength);
		expect(actualEndsWithEllipsis).toBe(expectedEndsWithEllipsis);
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

		const expectedFetchCall =
			"https://webmention.io/api/mentions.jf2?per-page=100&target=https%3A%2F%2Fwww.echooff.dev%2Fblog%2Fwhy-i-started-this-blog";
		const actualLikeCount = sectionModel.reactions.likeCount;
		const expectedLikeCount = 1;

		const actualFetchImplementation = fetchImplementation;

		expect(actualFetchImplementation).toHaveBeenCalledWith(expectedFetchCall);
		expect(actualLikeCount).toBe(expectedLikeCount);
	});

	it("throws when the API request fails", async () => {
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: false,
			json: async () => {
				return {};
			},
			status: 503
		} as Response);

		const actualLoadOperation = async (): Promise<Awaited<ReturnType<typeof loadWebmentionsForTargetUrl>>> => {
			return loadWebmentionsForTargetUrl(
				{
					fetch: fetchImplementation
				},
				"https://www.echooff.dev/blog/why-i-started-this-blog"
			);
		};
		const expectedErrorMessage = "Webmention API request failed with status 503";

		await expect(actualLoadOperation).rejects.toThrow(expectedErrorMessage);
	});
});
