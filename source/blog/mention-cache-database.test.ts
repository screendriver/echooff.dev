import process from "node:process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import assert from "node:assert";
import { suite, test } from "mocha";
import { just, nothing } from "true-myth/maybe";
import { isOk, ok, type Result } from "true-myth/result";
import { Unit } from "true-myth/unit";
import {
	createMentionCacheRepository,
	mentionCacheSchemaVersion,
	type MentionCacheEntry,
	type MentionCacheRepository
} from "./mention-cache-database.ts";

async function createTemporaryDatabasePath(): Promise<string> {
	const testDatabaseDirectoryPath = join(process.cwd(), "target", "mention-cache-database-tests");

	await mkdir(testDatabaseDirectoryPath, {
		recursive: true
	});

	const temporaryDirectoryPath = await mkdtemp(join(testDatabaseDirectoryPath, "database-"));

	return join(temporaryDirectoryPath, "mention-cache.sqlite");
}

async function removeTemporaryDatabaseFile(databasePath: string): Promise<void> {
	await rm(dirname(databasePath), {
		force: true,
		recursive: true
	});
}

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

async function createTestMentionCacheRepository(databasePath: string): Promise<MentionCacheRepository> {
	const mentionCacheRepositoryResult = await createMentionCacheRepository({
		busyTimeoutMilliseconds: 2000,
		databasePath
	});

	if (isOk(mentionCacheRepositoryResult)) {
		return mentionCacheRepositoryResult.value;
	}

	throw mentionCacheRepositoryResult.error;
}

function unwrapTestResult<Value>(result: Result<Value, Error>): Value {
	if (isOk(result)) {
		return result.value;
	}

	throw result.error;
}

suite("mention cache database repository", function () {
	test("creates the schema idempotently", async function () {
		const databasePath = await createTemporaryDatabasePath();

		try {
			const firstMentionCacheRepository = await createTestMentionCacheRepository(databasePath);

			try {
				const secondMentionCacheRepository = await createTestMentionCacheRepository(databasePath);

				try {
					const expectedMentionCacheEntry = createMentionCacheEntry();
					const actualWriteResult = await secondMentionCacheRepository.writeEntry(expectedMentionCacheEntry);
					const actualReadResult = await firstMentionCacheRepository.readEntry(
						expectedMentionCacheEntry.cacheKey
					);

					assert.deepStrictEqual(actualWriteResult, ok(Unit));
					assert.deepStrictEqual(actualReadResult, ok(just(expectedMentionCacheEntry)));
				} finally {
					unwrapTestResult(await secondMentionCacheRepository.close());
				}
			} finally {
				unwrapTestResult(await firstMentionCacheRepository.close());
			}
		} finally {
			await removeTemporaryDatabaseFile(databasePath);
		}
	});

	test("writes and reads an entry", async function () {
		const databasePath = await createTemporaryDatabasePath();

		try {
			const mentionCacheRepository = await createTestMentionCacheRepository(databasePath);

			try {
				const expectedMentionCacheEntry = createMentionCacheEntry();

				const actualWriteResult = await mentionCacheRepository.writeEntry(expectedMentionCacheEntry);
				const actualMentionCacheEntry = await mentionCacheRepository.readEntry(
					expectedMentionCacheEntry.cacheKey
				);

				assert.deepStrictEqual(actualWriteResult, ok(Unit));
				assert.deepStrictEqual(actualMentionCacheEntry, ok(just(expectedMentionCacheEntry)));
			} finally {
				unwrapTestResult(await mentionCacheRepository.close());
			}
		} finally {
			await removeTemporaryDatabaseFile(databasePath);
		}
	});

	test("updates an older entry with newer fetched data", async function () {
		const databasePath = await createTemporaryDatabasePath();

		try {
			const mentionCacheRepository = await createTestMentionCacheRepository(databasePath);

			try {
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
			} finally {
				unwrapTestResult(await mentionCacheRepository.close());
			}
		} finally {
			await removeTemporaryDatabaseFile(databasePath);
		}
	});

	test("does not overwrite newer fetched data with older fetched data", async function () {
		const databasePath = await createTemporaryDatabasePath();

		try {
			const mentionCacheRepository = await createTestMentionCacheRepository(databasePath);

			try {
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
			} finally {
				unwrapTestResult(await mentionCacheRepository.close());
			}
		} finally {
			await removeTemporaryDatabaseFile(databasePath);
		}
	});

	test("deletes entries older than the cleanup threshold", async function () {
		const databasePath = await createTemporaryDatabasePath();

		try {
			const mentionCacheRepository = await createTestMentionCacheRepository(databasePath);

			try {
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

				const actualOldMentionCacheEntry = await mentionCacheRepository.readEntry(
					oldMentionCacheEntry.cacheKey
				);
				const actualCurrentMentionCacheEntry = await mentionCacheRepository.readEntry(
					currentMentionCacheEntry.cacheKey
				);

				assert.deepStrictEqual(actualOldMentionCacheEntry, ok(nothing()));
				assert.deepStrictEqual(actualCurrentMentionCacheEntry, ok(just(currentMentionCacheEntry)));
			} finally {
				unwrapTestResult(await mentionCacheRepository.close());
			}
		} finally {
			await removeTemporaryDatabaseFile(databasePath);
		}
	});
});
