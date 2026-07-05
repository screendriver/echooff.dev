import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { isPlainObject, isString } from "@sindresorhus/is";
import { createDeterministicWallClock } from "@enormora/wall-clock";
import { just, nothing, of as maybeOf, type Maybe } from "true-myth/maybe";
import { isOk } from "true-myth/result";
import { reject as rejectTask, resolve as resolveTask, type Task } from "true-myth/task";
import { Unit } from "true-myth/unit";
import {
	createMentionCacheKey,
	loadMentionCacheSectionModel,
	mentionCacheCleanupAgeDays,
	mentionCacheFreshMilliseconds,
	mentionCacheSchemaVersion,
	mentionCacheUsableStaleMilliseconds,
	parseMentionCacheValue,
	readMentionCacheFreshness,
	type LoadMentionCacheSectionModelInput,
	type MentionCacheEntry,
	type MentionCacheRepository
} from "./mention-cache.ts";
import type { RuntimeLogProperties } from "./runtime-logger.ts";

type TestMentionSectionModel = Record<string, unknown> & {
	readonly text: string;
};

type TestRuntimeWarningLogger = (message: string, error: unknown, properties: RuntimeLogProperties) => void;

type MemoryMentionCacheRepositoryInput = {
	readonly deleteError?: Error;
	readonly entries?: ReadonlyMap<string, MentionCacheEntry>;
	readonly readError?: Error;
	readonly writeError?: Error;
};

type MemoryMentionCacheRepository = MentionCacheRepository & {
	readonly readStoredEntry: (cacheKey: string) => Maybe<MentionCacheEntry>;
};

type TestLoadMentionCacheSectionModelInput = LoadMentionCacheSectionModelInput<TestMentionSectionModel>;
type CreateLoadMentionCacheSectionModelInput = Partial<TestLoadMentionCacheSectionModelInput>;

function createTestMentionSectionModel(text: string): TestMentionSectionModel {
	return {
		text
	};
}

function parseTestMentionSectionModel(serializedSectionModel: unknown): Maybe<TestMentionSectionModel> {
	if (!isPlainObject(serializedSectionModel)) {
		return nothing();
	}

	if (!isString(serializedSectionModel.text)) {
		return nothing();
	}

	return just({
		text: serializedSectionModel.text
	});
}

function createMentionCacheEntry(mentionCacheEntry: Partial<MentionCacheEntry> = {}): MentionCacheEntry {
	return {
		cacheKey: "mentions:v1:webmentions:target-url-hash",
		fetchedAt: "2026-07-04T10:00:00.000Z",
		schemaVersion: mentionCacheSchemaVersion,
		value: JSON.stringify(createTestMentionSectionModel("cached mentions")),
		...mentionCacheEntry
	};
}

function createMemoryMentionCacheRepository(
	memoryMentionCacheRepositoryInput: MemoryMentionCacheRepositoryInput = {}
): MemoryMentionCacheRepository {
	const {
		deleteError,
		entries = new Map<string, MentionCacheEntry>(),
		readError,
		writeError
	} = memoryMentionCacheRepositoryInput;
	const mutableEntries = new Map(entries);

	return {
		deleteEntriesFetchedBefore(fetchedBefore) {
			if (deleteError !== undefined) {
				return rejectTask(deleteError);
			}

			for (const [cacheKey, mentionCacheEntry] of mutableEntries) {
				if (mentionCacheEntry.fetchedAt < fetchedBefore) {
					mutableEntries.delete(cacheKey);
				}
			}

			return resolveTask(Unit);
		},
		readEntry(cacheKey) {
			if (readError !== undefined) {
				return rejectTask(readError);
			}

			return resolveTask(maybeOf(mutableEntries.get(cacheKey)));
		},
		readStoredEntry(cacheKey) {
			return maybeOf(mutableEntries.get(cacheKey));
		},
		writeEntry(mentionCacheEntry) {
			if (writeError !== undefined) {
				return rejectTask(writeError);
			}

			mutableEntries.set(mentionCacheEntry.cacheKey, mentionCacheEntry);

			return resolveTask(Unit);
		}
	};
}

async function unwrapTestTask<Value>(task: Task<Value, never>): Promise<Value> {
	const taskResult = await task;

	if (isOk(taskResult)) {
		return taskResult.value;
	}

	throw new Error("Unexpected rejected test task.");
}

function createLoadMentionCacheSectionModelInput(
	input: CreateLoadMentionCacheSectionModelInput = {}
): TestLoadMentionCacheSectionModelInput {
	const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
	const defaultInput: TestLoadMentionCacheSectionModelInput = {
		cacheKey: "mentions:v1:webmentions:target-url-hash",
		createEmptySectionModel() {
			return createTestMentionSectionModel("empty mentions");
		},
		freshMilliseconds: mentionCacheFreshMilliseconds,
		loadFreshSectionModel() {
			return resolveTask(createTestMentionSectionModel("fresh mentions"));
		},
		logWarning: logWarningFake,
		parseSectionModel: parseTestMentionSectionModel,
		repository: createMemoryMentionCacheRepository(),
		schemaVersion: mentionCacheSchemaVersion,
		serviceName: "Webmention",
		usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds,
		wallClock: createDeterministicWallClock({
			initialCurrentTimestampInMilliseconds: Date.parse("2026-07-04T10:30:00.000Z")
		})
	};

	return {
		...defaultInput,
		...input
	};
}

suite("createMentionCacheKey()", function () {
	test("creates a versioned cache key with a hashed target URL", function () {
		const actualCacheKey = createMentionCacheKey({
			schemaVersion: 1,
			serviceIdentifier: "webmentions",
			targetUrl: "https://example.com/blog/post"
		});
		const expectedCacheKey =
			"mentions:v1:webmentions:87a8a1059047fa456e8b2917518290a9f771f46c3f5c8555bb108ca187c3b145";

		assert.strictEqual(actualCacheKey, expectedCacheKey);
	});
});

suite("readMentionCacheFreshness()", function () {
	test("treats entries inside the fresh window as fresh", function () {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-07-04T07:59:59.000Z"),
			fetchedAt: "2026-07-04T00:00:00.000Z",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		assert.strictEqual(actualFreshness, "fresh");
	});

	test("treats entries outside the fresh window but inside the usable window as stale", function () {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-07-04T08:00:01.000Z"),
			fetchedAt: "2026-07-04T00:00:00.000Z",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		assert.strictEqual(actualFreshness, "stale");
	});

	test("treats entries outside the usable window as expired", function () {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-08-04T00:00:01.000Z"),
			fetchedAt: "2026-07-04T00:00:00.000Z",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		assert.strictEqual(actualFreshness, "expired");
	});

	test("treats invalid fetched timestamps as expired", function () {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-07-04T08:00:01.000Z"),
			fetchedAt: "not a date",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		assert.strictEqual(actualFreshness, "expired");
	});
});

suite("parseMentionCacheValue()", function () {
	test("ignores corrupted JSON cache values", function () {
		const actualParsedValue = parseMentionCacheValue({
			parseSectionModel: parseTestMentionSectionModel,
			value: "{"
		});

		assert.deepStrictEqual(actualParsedValue, nothing());
	});
});

suite("loadMentionCacheSectionModel()", function () {
	test("uses fresh cached values without loading again", async function () {
		const cacheKey = "mentions:v1:webmentions:fresh-target-url-hash";
		const loadFreshSectionModel = fake(function (): Task<TestMentionSectionModel, Error> {
			return resolveTask(createTestMentionSectionModel("fresh mentions"));
		});
		const repository = createMemoryMentionCacheRepository({
			entries: new Map([
				[
					cacheKey,
					createMentionCacheEntry({
						cacheKey,
						fetchedAt: "2026-07-04T10:00:00.000Z"
					})
				]
			])
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					loadFreshSectionModel,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("cached mentions"),
			state: "fresh"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.strictEqual(loadFreshSectionModel.notCalled, true);
	});

	test("renders stale cached values when refreshing fails", async function () {
		const cacheKey = "mentions:v1:webmentions:stale-target-url-hash";
		const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
		const logWarning: TestRuntimeWarningLogger = logWarningFake;
		const repository = createMemoryMentionCacheRepository({
			entries: new Map([
				[
					cacheKey,
					createMentionCacheEntry({
						cacheKey,
						fetchedAt: "2026-07-03T00:00:00.000Z"
					})
				]
			])
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					loadFreshSectionModel() {
						return rejectTask(new Error("service unavailable"));
					},
					logWarning,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("cached mentions"),
			state: "stale_after_error"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.strictEqual(logWarningFake.calledOnce, true);
		assert.strictEqual(logWarningFake.firstCall.args[0], "Unable to load Webmention mentions at runtime");
		assert.ok(logWarningFake.firstCall.args[1] instanceof Error);
		assert.deepStrictEqual(logWarningFake.firstCall.args[2], {
			cacheKey,
			event: "mention_section_load_failed",
			serviceName: "Webmention"
		});
	});

	test("writes and renders fresh values after a cache miss", async function () {
		const cacheKey = "mentions:v1:webmentions:miss-target-url-hash";
		const repository = createMemoryMentionCacheRepository();

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					repository
				})
			)
		);
		const actualStoredEntry = repository.readStoredEntry(cacheKey);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("fresh mentions"),
			state: "refreshed"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.deepStrictEqual(
			actualStoredEntry,
			just({
				cacheKey,
				fetchedAt: "2026-07-04T10:30:00.000Z",
				schemaVersion: mentionCacheSchemaVersion,
				value: JSON.stringify(createTestMentionSectionModel("fresh mentions"))
			})
		);
	});

	test("cleans entries older than the retention window after a successful refresh", async function () {
		const cacheKey = "mentions:v1:webmentions:cleanup-target-url-hash";
		const oldCacheKey = "mentions:v1:webmentions:old-target-url-hash";
		const retainedCacheKey = "mentions:v1:webmentions:retained-target-url-hash";
		const repository = createMemoryMentionCacheRepository({
			entries: new Map([
				[
					oldCacheKey,
					createMentionCacheEntry({
						cacheKey: oldCacheKey,
						fetchedAt: "2026-04-01T10:00:00.000Z"
					})
				],
				[
					retainedCacheKey,
					createMentionCacheEntry({
						cacheKey: retainedCacheKey,
						fetchedAt: "2026-04-06T10:00:00.000Z"
					})
				]
			])
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("fresh mentions"),
			state: "refreshed"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.strictEqual(repository.readStoredEntry(cacheKey).isJust, true);
		assert.deepStrictEqual(repository.readStoredEntry(oldCacheKey), nothing());
		assert.strictEqual(repository.readStoredEntry(retainedCacheKey).isJust, true);
		assert.strictEqual(mentionCacheCleanupAgeDays, 90);
	});

	test("renders an empty model after a cache miss when refreshing fails", async function () {
		const cacheKey = "mentions:v1:webmentions:miss-target-url-hash";

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					loadFreshSectionModel() {
						return rejectTask(new Error("service unavailable"));
					}
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("empty mentions"),
			state: "empty_after_error"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
	});

	test("ignores corrupted cached JSON and refreshes", async function () {
		const cacheKey = "mentions:v1:webmentions:corrupted-target-url-hash";
		const repository = createMemoryMentionCacheRepository({
			entries: new Map([
				[
					cacheKey,
					createMentionCacheEntry({
						cacheKey,
						value: "{"
					})
				]
			])
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("fresh mentions"),
			state: "refreshed"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
	});

	test("renders fresh values when cache writing fails", async function () {
		const cacheKey = "mentions:v1:webmentions:write-failure-target-url-hash";
		const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
		const logWarning: TestRuntimeWarningLogger = logWarningFake;
		const repository = createMemoryMentionCacheRepository({
			writeError: new Error("database is busy")
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					logWarning,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("fresh mentions"),
			state: "refreshed"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.strictEqual(logWarningFake.calledOnce, true);
		assert.strictEqual(logWarningFake.firstCall.args[0], "Unable to write Webmention mentions cache");
		assert.ok(logWarningFake.firstCall.args[1] instanceof Error);
		assert.deepStrictEqual(logWarningFake.firstCall.args[2], {
			cacheKey,
			event: "mention_cache_write_failed",
			serviceName: "Webmention"
		});
	});

	test("renders fresh values when cache cleanup fails", async function () {
		const cacheKey = "mentions:v1:webmentions:cleanup-failure-target-url-hash";
		const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
		const logWarning: TestRuntimeWarningLogger = logWarningFake;
		const repository = createMemoryMentionCacheRepository({
			deleteError: new Error("database is busy")
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					logWarning,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("fresh mentions"),
			state: "refreshed"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.strictEqual(logWarningFake.calledOnce, true);
		assert.strictEqual(logWarningFake.firstCall.args[0], "Unable to clean Webmention mentions cache");
		assert.ok(logWarningFake.firstCall.args[1] instanceof Error);
		assert.deepStrictEqual(logWarningFake.firstCall.args[2], {
			cacheKey,
			event: "mention_cache_cleanup_failed",
			serviceName: "Webmention"
		});
	});

	test("fetches directly when cache reading fails", async function () {
		const cacheKey = "mentions:v1:webmentions:read-failure-target-url-hash";
		const logWarningFake = fake<Parameters<TestRuntimeWarningLogger>, undefined>();
		const logWarning: TestRuntimeWarningLogger = logWarningFake;
		const repository = createMemoryMentionCacheRepository({
			readError: new Error("database is unavailable")
		});

		const actualLoadingResult = await unwrapTestTask(
			loadMentionCacheSectionModel(
				createLoadMentionCacheSectionModelInput({
					cacheKey,
					logWarning,
					repository
				})
			)
		);
		const expectedLoadingResult = {
			sectionModel: createTestMentionSectionModel("fresh mentions"),
			state: "refreshed"
		};

		assert.deepStrictEqual(actualLoadingResult, expectedLoadingResult);
		assert.strictEqual(logWarningFake.calledOnce, true);
		assert.strictEqual(logWarningFake.firstCall.args[0], "Unable to read Webmention mentions cache");
		assert.ok(logWarningFake.firstCall.args[1] instanceof Error);
		assert.deepStrictEqual(logWarningFake.firstCall.args[2], {
			cacheKey,
			event: "mention_cache_read_failed",
			serviceName: "Webmention"
		});
	});
});
