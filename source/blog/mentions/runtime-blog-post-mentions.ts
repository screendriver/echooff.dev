import { isError } from "@sindresorhus/is";
import type { Clock } from "@enormora/clock/clock";
import { match } from "ts-pattern";
import type { Result } from "true-myth/result";
import { tryOrElse, type Task } from "true-myth/task";
import type { RuntimeLogProperties } from "../runtime-logger.ts";
import {
	createEmptyHackerNewsSectionModel,
	type HackerNewsSectionModel,
	loadHackerNewsMentionsForTargetUrl,
	parseCachedHackerNewsSectionModel
} from "./hacker-news/hacker-news-mentions.ts";
import {
	createMentionCacheKey,
	loadMentionCacheSectionModel,
	mentionCacheFreshMilliseconds,
	mentionCacheSchemaVersion,
	mentionCacheUsableStaleMilliseconds,
	type MentionCacheRepository,
	type MentionCacheSectionLoadingResult,
	type MentionCacheSectionLoadState
} from "./cache/mention-cache.ts";
import {
	createEmptyWebmentionSectionModel,
	loadWebmentionsForTargetUrl,
	parseCachedWebmentionSectionModel,
	type WebmentionSectionModel
} from "./webmentions/webmentions.ts";

export type BlogPostMentionsModel = {
	readonly hackerNewsSectionModel: HackerNewsSectionModel;
	readonly webmentionSectionModel: WebmentionSectionModel;
};

type BlogPostMentionsDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly logInfo: (message: string, properties: RuntimeLogProperties) => void;
	readonly logWarning: (message: string, error: unknown, properties: RuntimeLogProperties) => void;
	readonly mentionCacheRepository: MentionCacheRepository;
	readonly requestTimeoutMilliseconds: number;
	readonly clock: Clock;
};
type MentionLoadingDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly timeoutMilliseconds: number;
};
type BlogPostMentionsLoadedLogPropertiesInput = {
	readonly durationMilliseconds: number;
	readonly hackerNewsDurationMilliseconds: number;
	readonly hackerNewsState: MentionCacheSectionLoadState;
	readonly targetPathname: string;
	readonly webmentionDurationMilliseconds: number;
	readonly webmentionState: MentionCacheSectionLoadState;
};
type TimedMentionCacheSectionLoadingResult<SectionModel> = MentionCacheSectionLoadingResult<SectionModel> & {
	readonly durationMilliseconds: number;
};

export const runtimeMentionRequestTimeoutMilliseconds = 5000;

function normalizeUnknownError(error: unknown): Error {
	return match(error)
		.when(isError, (knownError) => {
			return knownError;
		})
		.otherwise((unknownError) => {
			return new Error(String(unknownError));
		});
}

function createMentionLoadingDependencies(dependencies: BlogPostMentionsDependencies): MentionLoadingDependencies {
	return {
		createTimeoutSignal: dependencies.createTimeoutSignal,
		fetch: dependencies.fetch,
		timeoutMilliseconds: dependencies.requestTimeoutMilliseconds
	};
}

function didMentionSectionLoadUseErrorFallback(state: MentionCacheSectionLoadState): boolean {
	return match(state)
		.with("empty_after_error", "stale_after_error", () => {
			return true;
		})
		.otherwise(() => {
			return false;
		});
}

function createBlogPostMentionsLoadStatus(
	webmentionState: MentionCacheSectionLoadState,
	hackerNewsState: MentionCacheSectionLoadState
): "failed" | "ok" | "partial" {
	return match({ hackerNewsState, webmentionState })
		.with({ hackerNewsState: "empty_after_error", webmentionState: "empty_after_error" }, () => {
			return "failed" as const;
		})
		.when(
			(states) => {
				return (
					didMentionSectionLoadUseErrorFallback(states.webmentionState) ||
					didMentionSectionLoadUseErrorFallback(states.hackerNewsState)
				);
			},
			() => {
				return "partial" as const;
			}
		)
		.otherwise(() => {
			return "ok" as const;
		});
}

function createBlogPostMentionsLoadedLogProperties(
	input: BlogPostMentionsLoadedLogPropertiesInput
): RuntimeLogProperties {
	const {
		durationMilliseconds,
		hackerNewsDurationMilliseconds,
		hackerNewsState,
		targetPathname,
		webmentionDurationMilliseconds,
		webmentionState
	} = input;

	return {
		durationMilliseconds,
		event: "blog_post_mentions_loaded",
		hackerNewsDurationMilliseconds,
		hackerNewsState,
		status: createBlogPostMentionsLoadStatus(webmentionState, hackerNewsState),
		targetPathname,
		webmentionDurationMilliseconds,
		webmentionState
	};
}

function unwrapInfallibleResult<Value>(result: Result<Value, never>): Value {
	if (result.isOk) {
		return result.value;
	}

	return result.error;
}

function timeMentionCacheSectionLoad<SectionModel, RejectionReason>(
	clock: Clock,
	loadSectionModel: () => Task<MentionCacheSectionLoadingResult<SectionModel>, RejectionReason>
): Task<TimedMentionCacheSectionLoadingResult<SectionModel>, RejectionReason> {
	const startedAtUnixEpochMilliseconds = clock.currentUnixEpochMilliseconds;

	return loadSectionModel().map((loadingResult) => {
		const finishedAtUnixEpochMilliseconds = clock.currentUnixEpochMilliseconds;
		const durationMilliseconds = finishedAtUnixEpochMilliseconds - startedAtUnixEpochMilliseconds;

		return {
			...loadingResult,
			durationMilliseconds
		};
	});
}

export async function loadBlogPostMentionsForTargetUrl(
	dependencies: BlogPostMentionsDependencies,
	targetUrl: string
): Promise<BlogPostMentionsModel> {
	const startedAtUnixEpochMilliseconds = dependencies.clock.currentUnixEpochMilliseconds;
	const mentionLoadingDependencies = createMentionLoadingDependencies(dependencies);
	const [webmentionTaskResult, hackerNewsTaskResult] = await Promise.all([
		timeMentionCacheSectionLoad(dependencies.clock, () => {
			return loadMentionCacheSectionModel({
				cacheKey: createMentionCacheKey({
					schemaVersion: mentionCacheSchemaVersion,
					serviceIdentifier: "webmentions",
					targetUrl
				}),
				createEmptySectionModel: createEmptyWebmentionSectionModel,
				freshMilliseconds: mentionCacheFreshMilliseconds,
				loadFreshSectionModel() {
					return tryOrElse(normalizeUnknownError, async () => {
						return loadWebmentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
					});
				},
				logWarning: dependencies.logWarning,
				parseSectionModel: parseCachedWebmentionSectionModel,
				repository: dependencies.mentionCacheRepository,
				schemaVersion: mentionCacheSchemaVersion,
				serviceName: "Webmention",
				usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds,
				clock: dependencies.clock
			});
		}),
		timeMentionCacheSectionLoad(dependencies.clock, () => {
			return loadMentionCacheSectionModel({
				cacheKey: createMentionCacheKey({
					schemaVersion: mentionCacheSchemaVersion,
					serviceIdentifier: "hacker-news",
					targetUrl
				}),
				createEmptySectionModel: createEmptyHackerNewsSectionModel,
				freshMilliseconds: mentionCacheFreshMilliseconds,
				loadFreshSectionModel() {
					return tryOrElse(normalizeUnknownError, async () => {
						return loadHackerNewsMentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
					});
				},
				logWarning: dependencies.logWarning,
				parseSectionModel: parseCachedHackerNewsSectionModel,
				repository: dependencies.mentionCacheRepository,
				schemaVersion: mentionCacheSchemaVersion,
				serviceName: "Hacker News",
				usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds,
				clock: dependencies.clock
			});
		})
	]);
	const webmentionLoadingResult: TimedMentionCacheSectionLoadingResult<WebmentionSectionModel> =
		unwrapInfallibleResult(webmentionTaskResult);
	const hackerNewsLoadingResult: TimedMentionCacheSectionLoadingResult<HackerNewsSectionModel> =
		unwrapInfallibleResult(hackerNewsTaskResult);
	const finishedAtUnixEpochMilliseconds = dependencies.clock.currentUnixEpochMilliseconds;
	const targetUrlValue = new URL(targetUrl);
	const targetPathname = targetUrlValue.pathname;

	dependencies.logInfo(
		"Loaded blog post mentions",
		createBlogPostMentionsLoadedLogProperties({
			durationMilliseconds: finishedAtUnixEpochMilliseconds - startedAtUnixEpochMilliseconds,
			hackerNewsDurationMilliseconds: hackerNewsLoadingResult.durationMilliseconds,
			hackerNewsState: hackerNewsLoadingResult.state,
			targetPathname,
			webmentionDurationMilliseconds: webmentionLoadingResult.durationMilliseconds,
			webmentionState: webmentionLoadingResult.state
		})
	);

	return {
		hackerNewsSectionModel: hackerNewsLoadingResult.sectionModel,
		webmentionSectionModel: webmentionLoadingResult.sectionModel
	};
}
