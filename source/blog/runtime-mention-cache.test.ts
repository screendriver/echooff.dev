import { describe, expect, it } from "vitest";
import {
	createRuntimeMentionCache,
	readRuntimeMentionCache,
	writeRuntimeMentionCache
} from "./runtime-mention-cache.ts";

describe("runtime mention cache", () => {
	it("returns a miss when the cache has no entry for the key", () => {
		const cache = createRuntimeMentionCache<string>();
		const actualReadResult = readRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			ttlMilliseconds: 500
		});
		const expectedReadResult = {
			kind: "miss"
		};

		expect(actualReadResult).toStrictEqual(expectedReadResult);
	});

	it("returns fresh cached values inside the TTL", () => {
		const cache = createRuntimeMentionCache<string>();

		writeRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			value: "cached mentions"
		});

		const actualReadResult = readRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1499,
			ttlMilliseconds: 500
		});
		const expectedReadResult = {
			kind: "fresh",
			value: "cached mentions"
		};

		expect(actualReadResult).toStrictEqual(expectedReadResult);
	});

	it("returns stale cached values after the TTL", () => {
		const cache = createRuntimeMentionCache<string>();

		writeRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1000,
			value: "cached mentions"
		});

		const actualReadResult = readRuntimeMentionCache({
			cache,
			cacheKey: "https://example.com/blog/post",
			nowMilliseconds: 1501,
			ttlMilliseconds: 500
		});
		const expectedReadResult = {
			kind: "stale",
			value: "cached mentions"
		};

		expect(actualReadResult).toStrictEqual(expectedReadResult);
	});
});
