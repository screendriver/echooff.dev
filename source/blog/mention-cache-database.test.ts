import assert from "node:assert";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import { isOk, ok, type Result } from "true-myth/result";
import { Unit } from "true-myth/unit";
import { mentionCacheSchemaVersion, type ApplicationDatabaseConnection } from "./application-database.ts";
import { withTemporaryApplicationDatabase } from "./application-database-test-support.ts";
import { createMentionCacheRepository } from "./mention-cache-database.ts";
import type { MentionCacheEntry, MentionCacheRepository } from "./mention-cache.ts";

function createMentionCacheEntry(mentionCacheEntry: Partial<MentionCacheEntry> = {}): MentionCacheEntry {
	return {
		cacheKey: "mentions:v1:webmentions:target-url-hash",
		fetchedAt: "2026-07-04T10:00:00.000Z",
		schemaVersion: mentionCacheSchemaVersion,
		value: JSON.stringify({
			replies: [],
			reactions: {
				bookmarkCount: 0,
				likeCount: 1,
				repostCount: 0
			}
		}),
		...mentionCacheEntry
	};
}

function createTestMentionCacheRepository(
	applicationDatabaseConnection: ApplicationDatabaseConnection
): MentionCacheRepository {
	return createMentionCacheRepository(applicationDatabaseConnection.database);
}

function unwrapTestResult<Value>(result: Result<Value, Error>): Value {
	if (isOk(result)) {
		return result.value;
	}

	throw result.error;
}

suite("mention cache database repository", function () {
	test(
		"uses the shared application database without owning its lifecycle",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const firstMentionCacheRepository = createTestMentionCacheRepository(applicationDatabaseConnection);
			const secondMentionCacheRepository = createTestMentionCacheRepository(applicationDatabaseConnection);
			const expectedMentionCacheEntry = createMentionCacheEntry();

			const actualWriteResult = await secondMentionCacheRepository.writeEntry(expectedMentionCacheEntry);
			const actualReadResult = await firstMentionCacheRepository.readEntry(expectedMentionCacheEntry.cacheKey);

			assert.deepStrictEqual(actualWriteResult, ok(Unit));
			assert.deepStrictEqual(actualReadResult, ok(just(expectedMentionCacheEntry)));
		})
	);

	test(
		"writes and reads an entry",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const mentionCacheRepository = createTestMentionCacheRepository(applicationDatabaseConnection);
			const expectedMentionCacheEntry = createMentionCacheEntry();

			const actualWriteResult = await mentionCacheRepository.writeEntry(expectedMentionCacheEntry);
			const actualMentionCacheEntry = await mentionCacheRepository.readEntry(expectedMentionCacheEntry.cacheKey);

			assert.deepStrictEqual(actualWriteResult, ok(Unit));
			assert.deepStrictEqual(actualMentionCacheEntry, ok(just(expectedMentionCacheEntry)));
		})
	);

	test(
		"updates an older entry with newer fetched data",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const mentionCacheRepository = createTestMentionCacheRepository(applicationDatabaseConnection);
			const olderMentionCacheEntry = createMentionCacheEntry({
				fetchedAt: "2026-07-04T10:00:00.000Z",
				value: JSON.stringify({ mentions: ["older"] })
			});
			const newerMentionCacheEntry = createMentionCacheEntry({
				fetchedAt: "2026-07-04T11:00:00.000Z",
				value: JSON.stringify({ mentions: ["newer"] })
			});

			unwrapTestResult(await mentionCacheRepository.writeEntry(olderMentionCacheEntry));
			unwrapTestResult(await mentionCacheRepository.writeEntry(newerMentionCacheEntry));

			const actualMentionCacheEntry = await mentionCacheRepository.readEntry(newerMentionCacheEntry.cacheKey);

			assert.deepStrictEqual(actualMentionCacheEntry, ok(just(newerMentionCacheEntry)));
		})
	);

	test(
		"does not overwrite newer fetched data with older fetched data",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const mentionCacheRepository = createTestMentionCacheRepository(applicationDatabaseConnection);
			const newerMentionCacheEntry = createMentionCacheEntry({
				fetchedAt: "2026-07-04T11:00:00.000Z",
				value: JSON.stringify({ mentions: ["newer"] })
			});
			const olderMentionCacheEntry = createMentionCacheEntry({
				fetchedAt: "2026-07-04T10:00:00.000Z",
				value: JSON.stringify({ mentions: ["older"] })
			});

			unwrapTestResult(await mentionCacheRepository.writeEntry(newerMentionCacheEntry));
			unwrapTestResult(await mentionCacheRepository.writeEntry(olderMentionCacheEntry));

			const actualMentionCacheEntry = await mentionCacheRepository.readEntry(newerMentionCacheEntry.cacheKey);

			assert.deepStrictEqual(actualMentionCacheEntry, ok(just(newerMentionCacheEntry)));
		})
	);

	test(
		"deletes entries older than the cleanup threshold",
		withTemporaryApplicationDatabase(async (applicationDatabaseConnection) => {
			const mentionCacheRepository = createTestMentionCacheRepository(applicationDatabaseConnection);
			const oldMentionCacheEntry = createMentionCacheEntry({
				cacheKey: "mentions:v1:webmentions:old-target-url-hash",
				fetchedAt: "2026-04-01T10:00:00.000Z"
			});
			const currentMentionCacheEntry = createMentionCacheEntry({
				cacheKey: "mentions:v1:webmentions:current-target-url-hash",
				fetchedAt: "2026-07-04T10:00:00.000Z"
			});

			unwrapTestResult(await mentionCacheRepository.writeEntry(oldMentionCacheEntry));
			unwrapTestResult(await mentionCacheRepository.writeEntry(currentMentionCacheEntry));
			unwrapTestResult(await mentionCacheRepository.deleteEntriesFetchedBefore("2026-06-01T00:00:00.000Z"));

			const actualOldMentionCacheEntry = await mentionCacheRepository.readEntry(oldMentionCacheEntry.cacheKey);
			const actualCurrentMentionCacheEntry = await mentionCacheRepository.readEntry(
				currentMentionCacheEntry.cacheKey
			);

			assert.deepStrictEqual(actualOldMentionCacheEntry, ok(nothing()));
			assert.deepStrictEqual(actualCurrentMentionCacheEntry, ok(just(currentMentionCacheEntry)));
		})
	);
});
