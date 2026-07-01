import { describe, expect, it, vi } from "vitest";
import { isString } from "@sindresorhus/is";
import { createRuntimeMentionCache, writeRuntimeMentionCache } from "./runtime-mention-cache.ts";
import {
	loadBlogPostMentionsForTargetUrl,
	loadRuntimeMentionSectionModel,
	runtimeMentionCacheTtlMilliseconds
} from "./runtime-blog-post-mentions.ts";
import type { RuntimeLogProperties } from "./runtime-logger.ts";

type TestRuntimeWarningLogger = (message: string, error: unknown, properties: RuntimeLogProperties) => void;
type TestRuntimeInfoLogger = (message: string, properties: RuntimeLogProperties) => void;

function readRequestUrlText(requestUrl: RequestInfo | URL): string {
	if (isString(requestUrl)) {
		return requestUrl;
	}

	if (requestUrl instanceof URL) {
		return requestUrl.href;
	}

	return requestUrl.url;
}

describe("runtimeMentionCacheTtlMilliseconds", () => {
	it("keeps mention cache entries fresh for eight hours", () => {
		const expectedCacheTtlMilliseconds = 8 * 60 * 60 * 1000;

		expect(runtimeMentionCacheTtlMilliseconds).toBe(expectedCacheTtlMilliseconds);
	});
});

describe("loadRuntimeMentionSectionModel()", () => {
	it("returns fresh cached values without loading again", async () => {
		const cache = createRuntimeMentionCache<string>();
		const loadFreshSectionModel = vi.fn<() => Promise<string>>().mockResolvedValue("fresh mentions");

		writeRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			value: "cached mentions"
		});
		const logWarning = vi.fn<TestRuntimeWarningLogger>();

		const actualLoadingResult = await loadRuntimeMentionSectionModel({
			cache,
			cacheKey: "https://example.com/blog/post",
			createEmptySectionModel() {
				return "empty mentions";
			},
			loadFreshSectionModel,
			logWarning,
			nowMilliseconds: 1100,
			serviceName: "Example",
			ttlMilliseconds: 500
		});
		const actualSectionModel = actualLoadingResult.sectionModel;
		const expectedSectionModel = "cached mentions";
		const actualState = actualLoadingResult.state;
		const expectedState = "fresh";

		expect(actualSectionModel).toBe(expectedSectionModel);
		expect(actualState).toBe(expectedState);
		expect(loadFreshSectionModel).not.toHaveBeenCalled();
	});

	it("refreshes stale cached values when loading succeeds", async () => {
		const cache = createRuntimeMentionCache<string>();

		writeRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			value: "stale mentions"
		});
		const logWarning = vi.fn<TestRuntimeWarningLogger>();

		const actualLoadingResult = await loadRuntimeMentionSectionModel({
			cache,
			cacheKey: "https://example.com/blog/post",
			createEmptySectionModel() {
				return "empty mentions";
			},
			async loadFreshSectionModel() {
				return "fresh mentions";
			},
			logWarning,
			nowMilliseconds: 2000,
			serviceName: "Example",
			ttlMilliseconds: 500
		});
		const actualSectionModel = actualLoadingResult.sectionModel;
		const expectedSectionModel = "fresh mentions";
		const actualState = actualLoadingResult.state;
		const expectedState = "refreshed";

		const actualCachedResult = cache.get("https://example.com/blog/post");
		const expectedCachedResult = {
			refreshedAtMilliseconds: 2000,
			value: "fresh mentions"
		};

		expect(actualSectionModel).toBe(expectedSectionModel);
		expect(actualState).toBe(expectedState);
		expect(actualCachedResult).toStrictEqual(expectedCachedResult);
	});

	it("returns stale cached values when refreshing fails", async () => {
		const cache = createRuntimeMentionCache<string>();
		const logWarning = vi.fn<TestRuntimeWarningLogger>();

		writeRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			value: "stale mentions"
		});

		const actualLoadingResult = await loadRuntimeMentionSectionModel({
			cache,
			cacheKey: "https://example.com/blog/post",
			createEmptySectionModel() {
				return "empty mentions";
			},
			async loadFreshSectionModel() {
				throw new Error("service unavailable");
			},
			logWarning,
			nowMilliseconds: 2000,
			serviceName: "Example",
			ttlMilliseconds: 500
		});
		const actualSectionModel = actualLoadingResult.sectionModel;
		const expectedSectionModel = "stale mentions";
		const actualState = actualLoadingResult.state;
		const expectedState = "stale_after_error";

		expect(actualSectionModel).toBe(expectedSectionModel);
		expect(actualState).toBe(expectedState);
		expect(logWarning).toHaveBeenCalledWith("Unable to load Example mentions at runtime", expect.any(Error), {
			cacheKey: "https://example.com/blog/post",
			event: "blog_post_mentions_section_load_failed",
			serviceName: "Example"
		});
	});

	it("returns an empty model when loading fails without cached data", async () => {
		const cache = createRuntimeMentionCache<string>();
		const logWarning = vi.fn<TestRuntimeWarningLogger>();

		const actualLoadingResult = await loadRuntimeMentionSectionModel({
			cache,
			cacheKey: "https://example.com/blog/post",
			createEmptySectionModel() {
				return "empty mentions";
			},
			async loadFreshSectionModel() {
				throw new Error("service unavailable");
			},
			logWarning,
			nowMilliseconds: 2000,
			serviceName: "Example",
			ttlMilliseconds: 500
		});
		const actualSectionModel = actualLoadingResult.sectionModel;
		const expectedSectionModel = "empty mentions";
		const actualState = actualLoadingResult.state;
		const expectedState = "empty_after_error";

		expect(actualSectionModel).toBe(expectedSectionModel);
		expect(actualState).toBe(expectedState);
	});
});

describe("loadBlogPostMentionsForTargetUrl()", () => {
	it("logs one structured event for a rendered mentions island", async () => {
		let nowCallCount = 0;
		const logInfo = vi.fn<TestRuntimeInfoLogger>();
		const logWarning = vi.fn<TestRuntimeWarningLogger>();
		const fetchImplementation = vi.fn<typeof fetch>(async (requestUrl) => {
			const requestUrlText = readRequestUrlText(requestUrl);

			if (requestUrlText.startsWith("https://webmention.io/api/mentions.jf2")) {
				return Response.json({
					children: []
				});
			}

			return Response.json({
				hits: []
			});
		});

		await loadBlogPostMentionsForTargetUrl(
			{
				createTimeoutSignal(timeoutMilliseconds) {
					return AbortSignal.timeout(timeoutMilliseconds);
				},
				fetch: fetchImplementation,
				logInfo,
				logWarning,
				nowMilliseconds() {
					nowCallCount += 1;

					if (nowCallCount === 1) {
						return 1000;
					}

					return 1250;
				},
				requestTimeoutMilliseconds: 5000,
				runtimeMentionCacheTtlMilliseconds: 500
			},
			"https://example.com/blog/runtime-log-test"
		);

		expect(logInfo).toHaveBeenCalledWith("Loaded blog post mentions", {
			durationMilliseconds: 250,
			event: "blog_post_mentions_loaded",
			hackerNewsState: "refreshed",
			status: "ok",
			targetPathname: "/blog/runtime-log-test",
			webmentionState: "refreshed"
		});
		expect(logWarning).not.toHaveBeenCalled();
	});
});
