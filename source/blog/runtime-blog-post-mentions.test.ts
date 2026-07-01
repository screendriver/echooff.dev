import { describe, expect, it, vi } from "vitest";
import { createRuntimeMentionCache, writeRuntimeMentionCache } from "./runtime-mention-cache.ts";
import { loadRuntimeMentionSectionModel, runtimeMentionCacheTtlMilliseconds } from "./runtime-blog-post-mentions.ts";

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
		const logWarning = vi.fn<(message: string, error: unknown) => void>();

		const actualSectionModel = await loadRuntimeMentionSectionModel({
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
		const expectedSectionModel = "cached mentions";

		expect(actualSectionModel).toBe(expectedSectionModel);
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
		const logWarning = vi.fn<(message: string, error: unknown) => void>();

		const actualSectionModel = await loadRuntimeMentionSectionModel({
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
		const expectedSectionModel = "fresh mentions";

		const actualCachedResult = cache.get("https://example.com/blog/post");
		const expectedCachedResult = {
			refreshedAtMilliseconds: 2000,
			value: "fresh mentions"
		};

		expect(actualSectionModel).toBe(expectedSectionModel);
		expect(actualCachedResult).toStrictEqual(expectedCachedResult);
	});

	it("returns stale cached values when refreshing fails", async () => {
		const cache = createRuntimeMentionCache<string>();
		const logWarning = vi.fn<(message: string, error: unknown) => void>();

		writeRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			value: "stale mentions"
		});

		const actualSectionModel = await loadRuntimeMentionSectionModel({
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
		const expectedSectionModel = "stale mentions";

		expect(actualSectionModel).toBe(expectedSectionModel);
		expect(logWarning).toHaveBeenCalledWith(
			'Unable to load Example mentions for "https://example.com/blog/post" at runtime',
			expect.any(Error)
		);
	});

	it("returns an empty model when loading fails without cached data", async () => {
		const cache = createRuntimeMentionCache<string>();
		const logWarning = vi.fn<(message: string, error: unknown) => void>();

		const actualSectionModel = await loadRuntimeMentionSectionModel({
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
		const expectedSectionModel = "empty mentions";

		expect(actualSectionModel).toBe(expectedSectionModel);
	});
});
