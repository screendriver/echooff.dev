import { describe, expect, it, vi } from "vitest";
import { just, nothing } from "true-myth/maybe";
import {
	createEmptyHackerNewsSectionModel,
	createHackerNewsApiRequestUrl,
	loadHackerNewsMentionsForTargetUrl,
	parseCachedHackerNewsSectionModel,
	parseHackerNewsApiResponse
} from "./hacker-news-mentions.ts";

describe("createEmptyHackerNewsSectionModel()", () => {
	it("creates an empty section model", () => {
		const actualSectionModel = createEmptyHackerNewsSectionModel();
		const expectedSectionModel = {
			mentions: []
		};

		expect(actualSectionModel).toStrictEqual(expectedSectionModel);
	});
});

describe("createHackerNewsApiRequestUrl()", () => {
	it("creates the API request URL for a target URL", () => {
		const actualRequestUrl = createHackerNewsApiRequestUrl({
			hackerNewsApiUrl: new URL("https://hn.algolia.com/api/v1/search_by_date"),
			targetUrl: "https://example.com/blog/why-i-started-this-blog"
		});
		const expectedRequestUrl =
			"https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=100&query=https%3A%2F%2Fexample.com%2Fblog%2Fwhy-i-started-this-blog";

		expect(actualRequestUrl).toBe(expectedRequestUrl);
	});
});

describe("parseHackerNewsApiResponse()", () => {
	it("returns only matching story mentions and sorts by published date descending", () => {
		const actualSectionModel = parseHackerNewsApiResponse("https://example.com/blog/why-i-started-this-blog", {
			hits: [
				{
					created_at: "2026-04-01T10:00:00.000Z",
					num_comments: 12,
					objectID: "44000001",
					points: 150,
					title: "Why I started this blog",
					url: "https://example.com/blog/why-i-started-this-blog"
				},
				{
					created_at: "2026-04-02T10:00:00.000Z",
					num_comments: 5,
					objectID: "44000002",
					points: 90,
					title: "Why I started this blog (repost)",
					url: "https://example.com/blog/why-i-started-this-blog"
				},
				{
					created_at: "2026-04-03T10:00:00.000Z",
					num_comments: 7,
					objectID: "44000003",
					points: 80,
					title: "Another post",
					url: "https://example.com/blog/some-other-post"
				},
				{
					created_at: "2026-04-04T10:00:00.000Z",
					num_comments: 2,
					objectID: "44000004",
					points: 10,
					url: "https://example.com/blog/why-i-started-this-blog"
				}
			]
		});

		const expectedSectionModel = {
			mentions: [
				{
					commentCount: 5,
					discussionUrl: "https://news.ycombinator.com/item?id=44000002",
					pointCount: 90,
					storyTitle: "Why I started this blog (repost)",
					submittedUrl: just("https://example.com/blog/why-i-started-this-blog"),
					visiblePublishedAt: just("2026-04-02T10:00:00.000Z")
				},
				{
					commentCount: 12,
					discussionUrl: "https://news.ycombinator.com/item?id=44000001",
					pointCount: 150,
					storyTitle: "Why I started this blog",
					submittedUrl: just("https://example.com/blog/why-i-started-this-blog"),
					visiblePublishedAt: just("2026-04-01T10:00:00.000Z")
				}
			]
		};

		expect(actualSectionModel).toStrictEqual(expectedSectionModel);
	});

	it("returns an empty model for malformed payloads", () => {
		const actualSectionModel = parseHackerNewsApiResponse("https://example.com/blog/why-i-started-this-blog", {
			hits: [{ foo: "bar" }]
		});
		const expectedSectionModel = {
			mentions: []
		};

		expect(actualSectionModel).toStrictEqual(expectedSectionModel);
	});
});

describe("parseCachedHackerNewsSectionModel()", () => {
	it("recreates Maybe values from a cached JSON section model", () => {
		const sectionModel = {
			mentions: [
				{
					commentCount: 5,
					discussionUrl: "https://news.ycombinator.com/item?id=44000002",
					pointCount: 90,
					storyTitle: "Why I started this blog",
					submittedUrl: just("https://example.com/blog/why-i-started-this-blog"),
					visiblePublishedAt: just("2026-04-02T10:00:00.000Z")
				}
			]
		};
		const serializedSectionModel = {
			mentions: [
				{
					commentCount: 5,
					discussionUrl: "https://news.ycombinator.com/item?id=44000002",
					pointCount: 90,
					storyTitle: "Why I started this blog",
					submittedUrl: {
						value: "https://example.com/blog/why-i-started-this-blog",
						variant: "Just"
					},
					visiblePublishedAt: {
						value: "2026-04-02T10:00:00.000Z",
						variant: "Just"
					}
				}
			]
		};

		const actualSectionModel = parseCachedHackerNewsSectionModel(serializedSectionModel);
		const expectedSectionModel = just(sectionModel);

		expect(actualSectionModel).toStrictEqual(expectedSectionModel);
	});

	it("ignores malformed cached section models", () => {
		const actualSectionModel = parseCachedHackerNewsSectionModel({
			mentions: [
				{
					commentCount: "5",
					discussionUrl: "https://news.ycombinator.com/item?id=44000002",
					pointCount: 90,
					storyTitle: "Why I started this blog",
					submittedUrl: {
						variant: "Nothing"
					},
					visiblePublishedAt: {
						variant: "Nothing"
					}
				}
			]
		});

		expect(actualSectionModel).toStrictEqual(nothing());
	});
});

describe("loadHackerNewsMentionsForTargetUrl()", () => {
	it("fetches and parses mentions for the target URL", async () => {
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: true,
			async json() {
				return {
					hits: [
						{
							created_at: "2026-04-01T10:00:00.000Z",
							num_comments: 12,
							objectID: "44000001",
							points: 150,
							title: "Why I started this blog",
							url: "https://example.com/blog/why-i-started-this-blog"
						}
					]
				};
			},
			status: 200
		} as Response);

		const sectionModel = await loadHackerNewsMentionsForTargetUrl(
			{
				createTimeoutSignal(timeoutMilliseconds) {
					return AbortSignal.timeout(timeoutMilliseconds);
				},
				fetch: fetchImplementation,
				timeoutMilliseconds: 5000
			},
			"https://example.com/blog/why-i-started-this-blog"
		);

		const expectedFetchCall =
			"https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=100&query=https%3A%2F%2Fexample.com%2Fblog%2Fwhy-i-started-this-blog";
		const actualMentionCount = sectionModel.mentions.length;
		const expectedMentionCount = 1;
		const actualDiscussionUrl = sectionModel.mentions[0]?.discussionUrl;
		const expectedDiscussionUrl = "https://news.ycombinator.com/item?id=44000001";

		const actualFetchImplementation = fetchImplementation;

		expect(actualFetchImplementation).toHaveBeenCalledWith(expectedFetchCall, {
			signal: fetchImplementation.mock.calls[0]?.[1]?.signal
		});
		expect(fetchImplementation.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
		expect(actualMentionCount).toBe(expectedMentionCount);
		expect(actualDiscussionUrl).toBe(expectedDiscussionUrl);
	});

	it("uses the configured request timeout", async () => {
		const timeoutAbortController = new AbortController();
		const timeoutSignal = timeoutAbortController.signal;
		const createTimeoutSignal = vi
			.fn<(timeoutMilliseconds: number) => AbortSignal>()
			.mockReturnValue(timeoutSignal);
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: true,
			async json() {
				return {
					hits: []
				};
			},
			status: 200
		} as Response);

		await loadHackerNewsMentionsForTargetUrl(
			{
				createTimeoutSignal,
				fetch: fetchImplementation,
				timeoutMilliseconds: 123
			},
			"https://example.com/blog/why-i-started-this-blog"
		);

		expect(createTimeoutSignal).toHaveBeenCalledWith(123);
		expect(fetchImplementation).toHaveBeenCalledWith(expect.any(String), {
			signal: timeoutSignal
		});
	});

	it("throws when the API request fails", async () => {
		const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue({
			ok: false,
			async json() {
				return {};
			},
			status: 503
		} as Response);

		const actualLoadOperation = async (): Promise<
			Awaited<ReturnType<typeof loadHackerNewsMentionsForTargetUrl>>
		> => {
			return loadHackerNewsMentionsForTargetUrl(
				{
					createTimeoutSignal(timeoutMilliseconds) {
						return AbortSignal.timeout(timeoutMilliseconds);
					},
					fetch: fetchImplementation,
					timeoutMilliseconds: 5000
				},
				"https://example.com/blog/why-i-started-this-blog"
			);
		};
		const expectedErrorMessage = "Hacker News API request failed with status 503";

		await expect(actualLoadOperation).rejects.toThrow(expectedErrorMessage);
	});
});
