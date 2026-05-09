import { describe, expect, it, vi } from "vitest";
import { Maybe } from "true-myth";
import {
	createEmptyHackerNewsSectionModel,
	createHackerNewsApiRequestUrl,
	loadHackerNewsMentionsForTargetUrl,
	parseHackerNewsApiResponse
} from "./hacker-news-mentions.js";

describe("createEmptyHackerNewsSectionModel()", () => {
	it("creates an empty section model", () => {
		expect(createEmptyHackerNewsSectionModel()).toStrictEqual({
			mentions: []
		});
	});
});

describe("createHackerNewsApiRequestUrl()", () => {
	it("creates the API request URL for a target URL", () => {
		expect(
			createHackerNewsApiRequestUrl({
				hackerNewsApiUrl: new URL("https://hn.algolia.com/api/v1/search_by_date"),
				targetUrl: "https://www.echooff.dev/blog/why-i-started-this-blog"
			})
		).toBe(
			"https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=100&query=https%3A%2F%2Fwww.echooff.dev%2Fblog%2Fwhy-i-started-this-blog"
		);
	});
});

describe("parseHackerNewsApiResponse()", () => {
	it("returns only matching story mentions and sorts by published date descending", () => {
		const sectionModel = parseHackerNewsApiResponse("https://www.echooff.dev/blog/why-i-started-this-blog", {
			hits: [
				{
					created_at: "2026-04-01T10:00:00.000Z",
					num_comments: 12,
					objectID: "44000001",
					points: 150,
					title: "Why I started this blog",
					url: "https://www.echooff.dev/blog/why-i-started-this-blog"
				},
				{
					created_at: "2026-04-02T10:00:00.000Z",
					num_comments: 5,
					objectID: "44000002",
					points: 90,
					title: "Why I started this blog (repost)",
					url: "https://www.echooff.dev/blog/why-i-started-this-blog"
				},
				{
					created_at: "2026-04-03T10:00:00.000Z",
					num_comments: 7,
					objectID: "44000003",
					points: 80,
					title: "Another post",
					url: "https://www.echooff.dev/blog/some-other-post"
				},
				{
					created_at: "2026-04-04T10:00:00.000Z",
					num_comments: 2,
					objectID: "44000004",
					points: 10,
					url: "https://www.echooff.dev/blog/why-i-started-this-blog"
				}
			]
		});

		expect(sectionModel).toStrictEqual({
			mentions: [
				{
					commentCount: 5,
					discussionUrl: "https://news.ycombinator.com/item?id=44000002",
					pointCount: 90,
					storyTitle: "Why I started this blog (repost)",
					submittedUrl: Maybe.just("https://www.echooff.dev/blog/why-i-started-this-blog"),
					visiblePublishedAt: Maybe.just("2026-04-02T10:00:00.000Z")
				},
				{
					commentCount: 12,
					discussionUrl: "https://news.ycombinator.com/item?id=44000001",
					pointCount: 150,
					storyTitle: "Why I started this blog",
					submittedUrl: Maybe.just("https://www.echooff.dev/blog/why-i-started-this-blog"),
					visiblePublishedAt: Maybe.just("2026-04-01T10:00:00.000Z")
				}
			]
		});
	});

	it("returns an empty model for malformed payloads", () => {
		expect(
			parseHackerNewsApiResponse("https://www.echooff.dev/blog/why-i-started-this-blog", {
				hits: [{ foo: "bar" }]
			})
		).toStrictEqual({
			mentions: []
		});
	});
});

describe("loadHackerNewsMentionsForTargetUrl()", () => {
	it("fetches and parses mentions for the target URL", async () => {
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: true,
			json: async () => {
				return {
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
				};
			},
			status: 200
		} as Response);

		const sectionModel = await loadHackerNewsMentionsForTargetUrl(
			{
				fetch: fetchImplementation
			},
			"https://www.echooff.dev/blog/why-i-started-this-blog"
		);

		expect(fetchImplementation).toHaveBeenCalledWith(
			"https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=100&query=https%3A%2F%2Fwww.echooff.dev%2Fblog%2Fwhy-i-started-this-blog"
		);
		expect(sectionModel.mentions).toHaveLength(1);
		expect(sectionModel.mentions[0]?.discussionUrl).toBe("https://news.ycombinator.com/item?id=44000001");
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
			return loadHackerNewsMentionsForTargetUrl(
				{
					fetch: fetchImplementation
				},
				"https://www.echooff.dev/blog/why-i-started-this-blog"
			);
		}).rejects.toThrow("Hacker News API request failed with status 503");
	});
});
