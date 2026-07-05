import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
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

suite("loadBlogPostMentionsForTargetUrl()", function () {
	test("loads mentions through the persistent cache repository and logs one structured event", async function () {
		const targetUrl = "https://example.com/blog/runtime-log-test";
		const mentionCacheRepository = createMemoryMentionCacheRepository();
		const logInfoFake = fake<Parameters<TestRuntimeInfoLogger>, undefined>();
		const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
		const fetchFake = fake(async (requestUrl: RequestInfo | URL) => {
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
		const logInfo: TestRuntimeInfoLogger = logInfoFake;
		const logWarning: TestRuntimeWarningLogger = logWarningFake;
		const fetchImplementation: typeof fetch = fetchFake;
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

		assert.strictEqual(actualWebmentionCacheEntry.isJust, true);
		assert.strictEqual(actualHackerNewsCacheEntry.isJust, true);
		assert.notDeepStrictEqual(actualWebmentionCacheEntry, nothing());
		assert.notDeepStrictEqual(actualHackerNewsCacheEntry, nothing());
		assert.strictEqual(fetchFake.callCount, 2);
		assert.deepStrictEqual(logInfoFake.firstCall.args, [
			"Loaded blog post mentions",
			{
				durationMilliseconds: 0,
				event: "blog_post_mentions_loaded",
				hackerNewsState: "refreshed",
				status: "ok",
				targetPathname: "/blog/runtime-log-test",
				webmentionState: "refreshed"
			}
		]);
		assert.strictEqual(logWarningFake.notCalled, true);
	});

	test("reuses fresh cached mention sections without fetching", async function () {
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
		const logInfoFake = fake<Parameters<TestRuntimeInfoLogger>, undefined>();
		const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
		const fetchFake = fake(async () => {
			return Response.json({});
		});
		const logInfo: TestRuntimeInfoLogger = logInfoFake;
		const logWarning: TestRuntimeWarningLogger = logWarningFake;
		const fetchImplementation: typeof fetch = fetchFake;
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

		assert.strictEqual(fetchFake.notCalled, true);
		assert.deepStrictEqual(logInfoFake.firstCall.args, [
			"Loaded blog post mentions",
			{
				durationMilliseconds: 0,
				event: "blog_post_mentions_loaded",
				hackerNewsState: "fresh",
				status: "ok",
				targetPathname: "/blog/cached-runtime-log-test",
				webmentionState: "fresh"
			}
		]);
		assert.strictEqual(logWarningFake.notCalled, true);
	});
});
