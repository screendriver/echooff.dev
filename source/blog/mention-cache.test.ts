import { describe, expect, it, vi } from "vitest";
import { isPlainObject, isString } from "@sindresorhus/is";
import { createDeterministicWallClock } from "@enormora/wall-clock";
import { just, nothing, of as maybeOf, type Maybe } from "true-myth/maybe";
import { isOk } from "true-myth/result";
import { reject as rejectTask, resolve as resolveTask, type Task } from "true-myth/task";
import {
	createMentionCacheKey,
	loadMentionCacheSectionModel,
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
	const { entries = new Map<string, MentionCacheEntry>(), readError, writeError } = memoryMentionCacheRepositoryInput;
	const mutableEntries = new Map(entries);

	return {
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

			return resolveTask(undefined);
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
	const defaultInput: TestLoadMentionCacheSectionModelInput = {
		cacheKey: "mentions:v1:webmentions:target-url-hash",
		createEmptySectionModel() {
			return createTestMentionSectionModel("empty mentions");
		},
		freshMilliseconds: mentionCacheFreshMilliseconds,
		loadFreshSectionModel() {
			return resolveTask(createTestMentionSectionModel("fresh mentions"));
		},
		logWarning: vi.fn<TestRuntimeWarningLogger>(),
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

describe("createMentionCacheKey()", () => {
	it("creates a versioned cache key with a hashed target URL", () => {
		const actualCacheKey = createMentionCacheKey({
			schemaVersion: 1,
			serviceIdentifier: "webmentions",
			targetUrl: "https://example.com/blog/post"
		});
		const expectedCacheKey =
			"mentions:v1:webmentions:87a8a1059047fa456e8b2917518290a9f771f46c3f5c8555bb108ca187c3b145";

		expect(actualCacheKey).toBe(expectedCacheKey);
	});
});

describe("readMentionCacheFreshness()", () => {
	it("treats entries inside the fresh window as fresh", () => {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-07-04T07:59:59.000Z"),
			fetchedAt: "2026-07-04T00:00:00.000Z",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		expect(actualFreshness).toBe("fresh");
	});

	it("treats entries outside the fresh window but inside the usable window as stale", () => {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-07-04T08:00:01.000Z"),
			fetchedAt: "2026-07-04T00:00:00.000Z",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		expect(actualFreshness).toBe("stale");
	});

	it("treats entries outside the usable window as expired", () => {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-08-04T00:00:01.000Z"),
			fetchedAt: "2026-07-04T00:00:00.000Z",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		expect(actualFreshness).toBe("expired");
	});

	it("treats invalid fetched timestamps as expired", () => {
		const actualFreshness = readMentionCacheFreshness({
			currentDate: new Date("2026-07-04T08:00:01.000Z"),
			fetchedAt: "not a date",
			freshMilliseconds: mentionCacheFreshMilliseconds,
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds
		});

		expect(actualFreshness).toBe("expired");
	});
});

describe("parseMentionCacheValue()", () => {
	it("ignores corrupted JSON cache values", () => {
		const actualParsedValue = parseMentionCacheValue({
			parseSectionModel: parseTestMentionSectionModel,
			value: "{"
		});

		expect(actualParsedValue).toStrictEqual(nothing());
	});
});

describe("loadMentionCacheSectionModel()", () => {
	it("uses fresh cached values without loading again", async () => {
		const cacheKey = "mentions:v1:webmentions:fresh-target-url-hash";
		const loadFreshSectionModel = vi.fn<() => Task<TestMentionSectionModel, Error>>(() => {
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
		expect(loadFreshSectionModel).not.toHaveBeenCalled();
	});

	it("renders stale cached values when refreshing fails", async () => {
		const cacheKey = "mentions:v1:webmentions:stale-target-url-hash";
		const logWarning = vi.fn<TestRuntimeWarningLogger>();
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
		expect(logWarning).toHaveBeenCalledWith("Unable to load Webmention mentions at runtime", expect.any(Error), {
			cacheKey,
			event: "mention_section_load_failed",
			serviceName: "Webmention"
		});
	});

	it("writes and renders fresh values after a cache miss", async () => {
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
		expect(actualStoredEntry).toStrictEqual(
			just({
				cacheKey,
				fetchedAt: "2026-07-04T10:30:00.000Z",
				schemaVersion: mentionCacheSchemaVersion,
				value: JSON.stringify(createTestMentionSectionModel("fresh mentions"))
			})
		);
	});

	it("renders an empty model after a cache miss when refreshing fails", async () => {
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
	});

	it("ignores corrupted cached JSON and refreshes", async () => {
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
	});

	it("renders fresh values when cache writing fails", async () => {
		const cacheKey = "mentions:v1:webmentions:write-failure-target-url-hash";
		const logWarning = vi.fn<TestRuntimeWarningLogger>();
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
		expect(logWarning).toHaveBeenCalledWith("Unable to write Webmention mentions cache", expect.any(Error), {
			cacheKey,
			event: "mention_cache_write_failed",
			serviceName: "Webmention"
		});
	});

	it("fetches directly when cache reading fails", async () => {
		const cacheKey = "mentions:v1:webmentions:read-failure-target-url-hash";
		const logWarning = vi.fn<TestRuntimeWarningLogger>();
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

		expect(actualLoadingResult).toStrictEqual(expectedLoadingResult);
		expect(logWarning).toHaveBeenCalledWith("Unable to read Webmention mentions cache", expect.any(Error), {
			cacheKey,
			event: "mention_cache_read_failed",
			serviceName: "Webmention"
		});
	});
});
