import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { just, nothing } from "true-myth/maybe";
import {
	createEmptyHackerNewsSectionModel,
	createHackerNewsApiRequestUrl,
	loadHackerNewsMentionsForTargetUrl,
	parseCachedHackerNewsSectionModel,
	parseHackerNewsApiResponse
} from "./hacker-news-mentions.ts";

suite("createEmptyHackerNewsSectionModel()", function () {
	test("creates an empty section model", function () {
		const actualSectionModel = createEmptyHackerNewsSectionModel();
		const expectedSectionModel = {
			mentions: []
		};

		assert.deepStrictEqual(actualSectionModel, expectedSectionModel);
	});
});

suite("createHackerNewsApiRequestUrl()", function () {
	test("creates the API request URL for a target URL", function () {
		const actualRequestUrl = createHackerNewsApiRequestUrl({
			hackerNewsApiUrl: new URL("https://hn.algolia.com/api/v1/search_by_date"),
			targetUrl: "https://example.com/blog/why-i-started-this-blog"
		});
		const expectedRequestUrl =
			"https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=100&query=https%3A%2F%2Fexample.com%2Fblog%2Fwhy-i-started-this-blog";

		assert.strictEqual(actualRequestUrl, expectedRequestUrl);
	});
});

suite("parseHackerNewsApiResponse()", function () {
	test("returns only matching story mentions and sorts by published date descending", function () {
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

		assert.deepStrictEqual(actualSectionModel, expectedSectionModel);
	});

	test("returns an empty model for malformed payloads", function () {
		const actualSectionModel = parseHackerNewsApiResponse("https://example.com/blog/why-i-started-this-blog", {
			hits: [{ foo: "bar" }]
		});
		const expectedSectionModel = {
			mentions: []
		};

		assert.deepStrictEqual(actualSectionModel, expectedSectionModel);
	});
});

suite("parseCachedHackerNewsSectionModel()", function () {
	test("recreates Maybe values from a cached JSON section model", function () {
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

		assert.deepStrictEqual(actualSectionModel, expectedSectionModel);
	});

	test("ignores malformed cached section models", function () {
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

		assert.deepStrictEqual(actualSectionModel, nothing());
	});
});

suite("loadHackerNewsMentionsForTargetUrl()", function () {
	test("fetches and parses mentions for the target URL", async function () {
		const fetchFake = fake.resolves<Parameters<typeof fetch>, ReturnType<typeof fetch>>(
			Response.json({
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
			})
		);
		const fetchImplementation: typeof fetch = fetchFake;

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

		assert.strictEqual(fetchFake.calledOnce, true);
		const actualFetchCall = fetchFake.firstCall;

		assert.strictEqual(actualFetchCall.args[0], expectedFetchCall);
		assert.ok(actualFetchCall.args[1]?.signal instanceof AbortSignal);
		assert.strictEqual(actualMentionCount, expectedMentionCount);
		assert.strictEqual(actualDiscussionUrl, expectedDiscussionUrl);
	});

	test("uses the configured request timeout", async function () {
		const timeoutAbortController = new AbortController();
		const timeoutSignal = timeoutAbortController.signal;
		const recordedTimeoutMilliseconds: number[] = [];
		function createTimeoutSignal(timeoutMilliseconds: number): AbortSignal {
			recordedTimeoutMilliseconds.push(timeoutMilliseconds);

			return timeoutSignal;
		}
		const fetchFake = fake.resolves<Parameters<typeof fetch>, ReturnType<typeof fetch>>(
			Response.json({
				hits: []
			})
		);
		const fetchImplementation: typeof fetch = fetchFake;

		await loadHackerNewsMentionsForTargetUrl(
			{
				createTimeoutSignal,
				fetch: fetchImplementation,
				timeoutMilliseconds: 123
			},
			"https://example.com/blog/why-i-started-this-blog"
		);

		const actualFetchCall = fetchFake.firstCall;

		assert.deepStrictEqual(recordedTimeoutMilliseconds, [123]);
		assert.strictEqual(typeof actualFetchCall.args[0], "string");
		assert.deepStrictEqual(actualFetchCall.args[1], { signal: timeoutSignal });
	});

	test("throws when the API request fails", async function () {
		const fetchFake = fake.resolves<Parameters<typeof fetch>, ReturnType<typeof fetch>>(
			new Response("{}", { status: 503 })
		);
		const fetchImplementation: typeof fetch = fetchFake;

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

		await assert.rejects(actualLoadOperation, { message: expectedErrorMessage });
	});
});
