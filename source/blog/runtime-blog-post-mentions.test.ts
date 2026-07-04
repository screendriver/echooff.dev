import { describe, expect, it, vi } from "vitest";
import { isString } from "@sindresorhus/is";
import { createDeterministicWallClock } from "@enormora/wall-clock";
import { nothing, of as maybeOf, type Maybe } from "true-myth/maybe";
import { resolve as resolveTask, type Task } from "true-myth/task";
import { Unit } from "true-myth/unit";
import {
	createMentionCacheKey,
	mentionCacheSchemaVersion,
	type MentionCacheEntry,
	type MentionCacheRepository
} from "./mention-cache.ts";
import { loadBlogPostMentionsForTargetUrl } from "./runtime-blog-post-mentions.ts";
import type { RuntimeLogProperties } from "./runtime-logger.ts";

type TestRuntimeWarningLogger = (message: string, error: unknown, properties: RuntimeLogProperties) => void;
type TestRuntimeInfoLogger = (message: string, properties: RuntimeLogProperties) => void;

type MemoryMentionCacheRepository = MentionCacheRepository & {
	readonly readStoredEntry: (cacheKey: string) => Maybe<MentionCacheEntry>;
};

function readRequestUrlText(requestUrl: RequestInfo | URL): string {
	if (isString(requestUrl)) {
		return requestUrl;
	}

	if (requestUrl instanceof URL) {
		return requestUrl.href;
	}

	return requestUrl.url;
}

function createMemoryMentionCacheRepository(): MemoryMentionCacheRepository {
	const mutableEntries = new Map<string, MentionCacheEntry>();

	return {
		deleteEntriesFetchedBefore() {
			return resolveTask(Unit);
		},
		readEntry(cacheKey) {
			return resolveTask(maybeOf(mutableEntries.get(cacheKey)));
		},
		readStoredEntry(cacheKey) {
			return maybeOf(mutableEntries.get(cacheKey));
		},
		writeEntry(mentionCacheEntry) {
			mutableEntries.set(mentionCacheEntry.cacheKey, mentionCacheEntry);

			return resolveTask(Unit);
		}
	};
}

async function unwrapTestTask<Value>(task: Task<Value, Error>): Promise<Value> {
	const taskResult = await task;

	return taskResult.match({
		Err(error) {
			throw error;
		},
		Ok(value) {
			return value;
		}
	});
}

describe("loadBlogPostMentionsForTargetUrl()", () => {
	it("loads mentions through the persistent cache repository and logs one structured event", async () => {
		const targetUrl = "https://example.com/blog/runtime-log-test";
		const mentionCacheRepository = createMemoryMentionCacheRepository();
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
		const wallClock = createDeterministicWallClock({
			initialCurrentTimestampInMilliseconds: 1000
		});

		await loadBlogPostMentionsForTargetUrl(
			{
				createTimeoutSignal(timeoutMilliseconds) {
					return AbortSignal.timeout(timeoutMilliseconds);
				},
				fetch: fetchImplementation,
				logInfo,
				logWarning,
				mentionCacheRepository,
				requestTimeoutMilliseconds: 5000,
				wallClock
			},
			targetUrl
		);

		const webmentionCacheKey = createMentionCacheKey({
			schemaVersion: mentionCacheSchemaVersion,
			serviceIdentifier: "webmentions",
			targetUrl
		});
		const hackerNewsCacheKey = createMentionCacheKey({
			schemaVersion: mentionCacheSchemaVersion,
			serviceIdentifier: "hacker-news",
			targetUrl
		});
		const actualWebmentionCacheEntry = mentionCacheRepository.readStoredEntry(webmentionCacheKey);
		const actualHackerNewsCacheEntry = mentionCacheRepository.readStoredEntry(hackerNewsCacheKey);

		expect(actualWebmentionCacheEntry.isJust).toBe(true);
		expect(actualHackerNewsCacheEntry.isJust).toBe(true);
		expect(actualWebmentionCacheEntry).not.toStrictEqual(nothing());
		expect(actualHackerNewsCacheEntry).not.toStrictEqual(nothing());
		expect(logInfo).toHaveBeenCalledWith("Loaded blog post mentions", {
			durationMilliseconds: 0,
			event: "blog_post_mentions_loaded",
			hackerNewsState: "refreshed",
			status: "ok",
			targetPathname: "/blog/runtime-log-test",
			webmentionState: "refreshed"
		});
		expect(logWarning).not.toHaveBeenCalled();
	});

	it("reuses fresh cached mention sections without fetching", async () => {
		const targetUrl = "https://example.com/blog/cached-runtime-log-test";
		const mentionCacheRepository = createMemoryMentionCacheRepository();
		const webmentionCacheKey = createMentionCacheKey({
			schemaVersion: mentionCacheSchemaVersion,
			serviceIdentifier: "webmentions",
			targetUrl
		});
		const hackerNewsCacheKey = createMentionCacheKey({
			schemaVersion: mentionCacheSchemaVersion,
			serviceIdentifier: "hacker-news",
			targetUrl
		});
		await unwrapTestTask(
			mentionCacheRepository.writeEntry({
				cacheKey: webmentionCacheKey,
				fetchedAt: "1970-01-01T00:00:01.000Z",
				schemaVersion: mentionCacheSchemaVersion,
				value: JSON.stringify({
					reactions: {
						bookmarkCount: 0,
						likeCount: 0,
						repostCount: 0
					},
					replies: []
				})
			})
		);
		await unwrapTestTask(
			mentionCacheRepository.writeEntry({
				cacheKey: hackerNewsCacheKey,
				fetchedAt: "1970-01-01T00:00:01.000Z",
				schemaVersion: mentionCacheSchemaVersion,
				value: JSON.stringify({
					mentions: []
				})
			})
		);
		const logInfo = vi.fn<TestRuntimeInfoLogger>();
		const logWarning = vi.fn<TestRuntimeWarningLogger>();
		const fetchImplementation = vi.fn<typeof fetch>();
		const wallClock = createDeterministicWallClock({
			initialCurrentTimestampInMilliseconds: 1000
		});

		await loadBlogPostMentionsForTargetUrl(
			{
				createTimeoutSignal(timeoutMilliseconds) {
					return AbortSignal.timeout(timeoutMilliseconds);
				},
				fetch: fetchImplementation,
				logInfo,
				logWarning,
				mentionCacheRepository,
				requestTimeoutMilliseconds: 5000,
				wallClock
			},
			targetUrl
		);

		expect(fetchImplementation).not.toHaveBeenCalled();
		expect(logInfo).toHaveBeenCalledWith("Loaded blog post mentions", {
			durationMilliseconds: 0,
			event: "blog_post_mentions_loaded",
			hackerNewsState: "fresh",
			status: "ok",
			targetPathname: "/blog/cached-runtime-log-test",
			webmentionState: "fresh"
		});
		expect(logWarning).not.toHaveBeenCalled();
	});
});
