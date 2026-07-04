import { createHash } from "node:crypto";
import { isError } from "@sindresorhus/is";
import type { WallClock } from "@enormora/wall-clock";
import { differenceInMilliseconds, isValid, parseISO } from "date-fns";
import { nothing, type Maybe } from "true-myth/maybe";
import { resolve as resolveTask, tryOrElse as tryTaskOrElse, type Task } from "true-myth/task";
import type { RuntimeLogProperties } from "./runtime-logger.ts";

export const mentionCacheFreshMilliseconds = 8 * 60 * 60 * 1000;
export const mentionCacheSchemaVersion = 1;
export const mentionCacheUsableStaleMilliseconds = 30 * 24 * 60 * 60 * 1000;

export type MentionCacheServiceIdentifier = "hacker-news" | "webmentions";

export type MentionCacheEntry = {
	readonly cacheKey: string;
	readonly fetchedAt: string;
	readonly schemaVersion: number;
	readonly value: string;
};

export type MentionCacheRepository = {
	readonly readEntry: (cacheKey: string) => Task<Maybe<MentionCacheEntry>, Error>;
	readonly writeEntry: (mentionCacheEntry: MentionCacheEntry) => Task<void, Error>;
};

export type MentionCacheFreshness = "expired" | "fresh" | "stale";

export type MentionCacheSectionLoadState = "empty_after_error" | "fresh" | "refreshed" | "stale_after_error";

export type MentionCacheSectionLoadingResult<SectionModel> = {
	readonly sectionModel: SectionModel;
	readonly state: MentionCacheSectionLoadState;
};

type MentionCacheKeyInput = {
	readonly schemaVersion: number;
	readonly serviceIdentifier: MentionCacheServiceIdentifier;
	readonly targetUrl: string;
};

type MentionCacheFreshnessInput = {
	readonly currentDate: Date;
	readonly fetchedAt: string;
	readonly freshMilliseconds: number;
	readonly usableStaleMilliseconds: number;
};

type ParseMentionCacheValueInput<SectionModel extends Record<string, unknown>> = {
	readonly parseSectionModel: (serializedSectionModel: unknown) => Maybe<SectionModel>;
	readonly value: string;
};

export type LoadMentionCacheSectionModelInput<SectionModel extends Record<string, unknown>> = {
	readonly cacheKey: string;
	readonly createEmptySectionModel: () => SectionModel;
	readonly freshMilliseconds: number;
	readonly loadFreshSectionModel: () => Task<SectionModel, Error>;
	readonly logWarning: (message: string, error: unknown, properties: RuntimeLogProperties) => void;
	readonly parseSectionModel: (serializedSectionModel: unknown) => Maybe<SectionModel>;
	readonly repository: MentionCacheRepository;
	readonly schemaVersion: number;
	readonly serviceName: string;
	readonly usableStaleMilliseconds: number;
	readonly wallClock: WallClock;
};

type RefreshMentionSectionModelInput<SectionModel extends Record<string, unknown>> = {
	readonly cacheKey: string;
	readonly createEmptySectionModel: () => SectionModel;
	readonly loadFreshSectionModel: () => Task<SectionModel, Error>;
	readonly logWarning: (message: string, error: unknown, properties: RuntimeLogProperties) => void;
	readonly repository: MentionCacheRepository;
	readonly requestedAt: Date;
	readonly schemaVersion: number;
	readonly serviceName: string;
	readonly staleSectionModel: Maybe<SectionModel>;
};

type MentionCacheWarningPropertiesInput = {
	readonly cacheKey: string;
	readonly eventName: string;
	readonly serviceName: string;
};

function normalizeMentionCacheError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

function createTargetUrlHash(targetUrl: string): string {
	return createHash("sha256").update(targetUrl).digest("hex");
}

function createMentionCacheWarningProperties(input: MentionCacheWarningPropertiesInput): RuntimeLogProperties {
	const { cacheKey, eventName, serviceName } = input;

	return {
		cacheKey,
		event: eventName,
		serviceName
	};
}

export function createMentionCacheKey(mentionCacheKeyInput: MentionCacheKeyInput): string {
	const { schemaVersion, serviceIdentifier, targetUrl } = mentionCacheKeyInput;
	const targetUrlHash = createTargetUrlHash(targetUrl);

	return `mentions:v${schemaVersion}:${serviceIdentifier}:${targetUrlHash}`;
}

export function readMentionCacheFreshness(
	mentionCacheFreshnessInput: MentionCacheFreshnessInput
): MentionCacheFreshness {
	const { currentDate, fetchedAt, freshMilliseconds, usableStaleMilliseconds } = mentionCacheFreshnessInput;
	const fetchedAtDate = parseISO(fetchedAt);

	if (!isValid(fetchedAtDate)) {
		return "expired";
	}

	const cacheAgeMilliseconds = differenceInMilliseconds(currentDate, fetchedAtDate);

	if (cacheAgeMilliseconds <= freshMilliseconds) {
		return "fresh";
	}

	if (cacheAgeMilliseconds <= usableStaleMilliseconds) {
		return "stale";
	}

	return "expired";
}

export function parseMentionCacheValue<SectionModel extends Record<string, unknown>>(
	parseMentionCacheValueInput: ParseMentionCacheValueInput<SectionModel>
): Maybe<SectionModel> {
	const { parseSectionModel, value } = parseMentionCacheValueInput;

	try {
		return parseSectionModel(JSON.parse(value) as unknown);
	} catch {
		return nothing<SectionModel>();
	}
}

function readMentionCacheEntrySectionModel<SectionModel extends Record<string, unknown>>(
	mentionCacheEntry: MentionCacheEntry,
	parseSectionModel: (serializedSectionModel: unknown) => Maybe<SectionModel>
): Maybe<SectionModel> {
	return parseMentionCacheValue({
		parseSectionModel,
		value: mentionCacheEntry.value
	});
}

async function refreshMentionSectionModel<SectionModel extends Record<string, unknown>>(
	refreshMentionSectionModelInput: RefreshMentionSectionModelInput<SectionModel>
): Promise<MentionCacheSectionLoadingResult<SectionModel>> {
	const {
		cacheKey,
		createEmptySectionModel,
		loadFreshSectionModel,
		logWarning,
		repository,
		requestedAt,
		schemaVersion,
		serviceName,
		staleSectionModel
	} = refreshMentionSectionModelInput;
	const freshSectionModelResult = await loadFreshSectionModel();

	if (freshSectionModelResult.isErr) {
		logWarning(
			`Unable to load ${serviceName} mentions at runtime`,
			freshSectionModelResult.error,
			createMentionCacheWarningProperties({
				cacheKey,
				eventName: "mention_section_load_failed",
				serviceName
			})
		);

		if (staleSectionModel.isJust) {
			return {
				sectionModel: staleSectionModel.value,
				state: "stale_after_error"
			};
		}

		return {
			sectionModel: createEmptySectionModel(),
			state: "empty_after_error"
		};
	}

	const writeResult = await repository.writeEntry({
		cacheKey,
		fetchedAt: requestedAt.toISOString(),
		schemaVersion,
		value: JSON.stringify(freshSectionModelResult.value)
	});

	if (writeResult.isErr) {
		logWarning(
			`Unable to write ${serviceName} mentions cache`,
			writeResult.error,
			createMentionCacheWarningProperties({
				cacheKey,
				eventName: "mention_cache_write_failed",
				serviceName
			})
		);
	}

	return {
		sectionModel: freshSectionModelResult.value,
		state: "refreshed" as const
	};
}

export function loadMentionCacheSectionModel<SectionModel extends Record<string, unknown>>(
	loadMentionCacheSectionModelInput: LoadMentionCacheSectionModelInput<SectionModel>
): Task<MentionCacheSectionLoadingResult<SectionModel>, never> {
	return tryTaskOrElse(
		normalizeMentionCacheError,
		async (): Promise<MentionCacheSectionLoadingResult<SectionModel>> => {
			const {
				cacheKey,
				createEmptySectionModel,
				freshMilliseconds,
				loadFreshSectionModel,
				logWarning,
				parseSectionModel,
				repository,
				schemaVersion,
				serviceName,
				usableStaleMilliseconds,
				wallClock
			} = loadMentionCacheSectionModelInput;
			const requestedAt = wallClock.currentDate;
			const cacheReadResult = await repository.readEntry(cacheKey);

			if (cacheReadResult.isErr) {
				logWarning(
					`Unable to read ${serviceName} mentions cache`,
					cacheReadResult.error,
					createMentionCacheWarningProperties({
						cacheKey,
						eventName: "mention_cache_read_failed",
						serviceName
					})
				);

				return refreshMentionSectionModel({
					cacheKey,
					createEmptySectionModel,
					loadFreshSectionModel,
					logWarning,
					repository,
					requestedAt,
					schemaVersion,
					serviceName,
					staleSectionModel: nothing<SectionModel>()
				});
			}

			if (cacheReadResult.value.isNothing) {
				return refreshMentionSectionModel({
					cacheKey,
					createEmptySectionModel,
					loadFreshSectionModel,
					logWarning,
					repository,
					requestedAt,
					schemaVersion,
					serviceName,
					staleSectionModel: nothing<SectionModel>()
				});
			}

			const cachedSectionModel = readMentionCacheEntrySectionModel(
				cacheReadResult.value.value,
				parseSectionModel
			);

			if (cachedSectionModel.isNothing) {
				return refreshMentionSectionModel({
					cacheKey,
					createEmptySectionModel,
					loadFreshSectionModel,
					logWarning,
					repository,
					requestedAt,
					schemaVersion,
					serviceName,
					staleSectionModel: nothing<SectionModel>()
				});
			}

			const freshness = readMentionCacheFreshness({
				fetchedAt: cacheReadResult.value.value.fetchedAt,
				freshMilliseconds,
				currentDate: requestedAt,
				usableStaleMilliseconds
			});

			if (freshness === "fresh") {
				return {
					sectionModel: cachedSectionModel.value,
					state: "fresh" as const
				};
			}

			return refreshMentionSectionModel({
				cacheKey,
				createEmptySectionModel,
				loadFreshSectionModel,
				logWarning,
				repository,
				requestedAt,
				schemaVersion,
				serviceName,
				staleSectionModel: freshness === "stale" ? cachedSectionModel : nothing<SectionModel>()
			});
		}
	).orElse((error) => {
		const { cacheKey, createEmptySectionModel, logWarning, serviceName } = loadMentionCacheSectionModelInput;

		logWarning(
			`Unable to load ${serviceName} mentions from cache`,
			normalizeMentionCacheError(error),
			createMentionCacheWarningProperties({
				cacheKey,
				eventName: "mention_cache_unexpected_failure",
				serviceName
			})
		);

		return resolveTask({
			sectionModel: createEmptySectionModel(),
			state: "empty_after_error" as const
		});
	});
}
