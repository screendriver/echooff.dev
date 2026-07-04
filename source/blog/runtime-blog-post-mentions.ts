import { isError } from "@sindresorhus/is";
import type { WallClock } from "@enormora/wall-clock";
import { match } from "ts-pattern";
import type { Result } from "true-myth/result";
import { tryOrElse as tryTaskOrElse } from "true-myth/task";
import {
	createEmptyHackerNewsSectionModel,
	type HackerNewsSectionModel,
	loadHackerNewsMentionsForTargetUrl,
	parseCachedHackerNewsSectionModel
} from "./hacker-news-mentions.ts";
import {
	createMentionCacheKey,
	loadMentionCacheSectionModel,
	mentionCacheFreshMilliseconds,
	mentionCacheSchemaVersion,
	mentionCacheUsableStaleMilliseconds,
	type MentionCacheRepository,
	type MentionCacheSectionLoadingResult,
	type MentionCacheSectionLoadState
} from "./mention-cache.ts";
import {
	createEmptyWebmentionSectionModel,
	loadWebmentionsForTargetUrl,
	parseCachedWebmentionSectionModel,
	type WebmentionSectionModel
} from "./webmentions.ts";
import type { RuntimeLogProperties } from "./runtime-logger.ts";

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
	readonly wallClock: WallClock;
};
type MentionLoadingDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly timeoutMilliseconds: number;
};
type BlogPostMentionsLoadedLogPropertiesInput = {
	readonly durationMilliseconds: number;
	readonly hackerNewsState: MentionCacheSectionLoadState;
	readonly targetPathname: string;
	readonly webmentionState: MentionCacheSectionLoadState;
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
	const { durationMilliseconds, hackerNewsState, targetPathname, webmentionState } = input;

	return {
		durationMilliseconds,
		event: "blog_post_mentions_loaded",
		hackerNewsState,
		status: createBlogPostMentionsLoadStatus(webmentionState, hackerNewsState),
		targetPathname,
		webmentionState
	};
}

function unwrapInfallibleResult<Value>(result: Result<Value, never>): Value {
	if (result.isOk) {
		return result.value;
	}

	return result.error;
}

export async function loadBlogPostMentionsForTargetUrl(
	dependencies: BlogPostMentionsDependencies,
	targetUrl: string
): Promise<BlogPostMentionsModel> {
	const startedAtMilliseconds = dependencies.wallClock.currentTimestampInMilliseconds;
	const mentionLoadingDependencies = createMentionLoadingDependencies(dependencies);
	const [webmentionTaskResult, hackerNewsTaskResult] = await Promise.all([
		loadMentionCacheSectionModel({
			cacheKey: createMentionCacheKey({
				schemaVersion: mentionCacheSchemaVersion,
				serviceIdentifier: "webmentions",
				targetUrl
			}),
			createEmptySectionModel: createEmptyWebmentionSectionModel,
			freshMilliseconds: mentionCacheFreshMilliseconds,
			loadFreshSectionModel() {
				return tryTaskOrElse(normalizeUnknownError, async () => {
					return loadWebmentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
				});
			},
			logWarning: dependencies.logWarning,
			parseSectionModel: parseCachedWebmentionSectionModel,
			repository: dependencies.mentionCacheRepository,
			schemaVersion: mentionCacheSchemaVersion,
			serviceName: "Webmention",
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds,
			wallClock: dependencies.wallClock
		}),
		loadMentionCacheSectionModel({
			cacheKey: createMentionCacheKey({
				schemaVersion: mentionCacheSchemaVersion,
				serviceIdentifier: "hacker-news",
				targetUrl
			}),
			createEmptySectionModel: createEmptyHackerNewsSectionModel,
			freshMilliseconds: mentionCacheFreshMilliseconds,
			loadFreshSectionModel() {
				return tryTaskOrElse(normalizeUnknownError, async () => {
					return loadHackerNewsMentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
				});
			},
			logWarning: dependencies.logWarning,
			parseSectionModel: parseCachedHackerNewsSectionModel,
			repository: dependencies.mentionCacheRepository,
			schemaVersion: mentionCacheSchemaVersion,
			serviceName: "Hacker News",
			usableStaleMilliseconds: mentionCacheUsableStaleMilliseconds,
			wallClock: dependencies.wallClock
		})
	]);
	const webmentionLoadingResult: MentionCacheSectionLoadingResult<WebmentionSectionModel> =
		unwrapInfallibleResult(webmentionTaskResult);
	const hackerNewsLoadingResult: MentionCacheSectionLoadingResult<HackerNewsSectionModel> =
		unwrapInfallibleResult(hackerNewsTaskResult);
	const finishedAtMilliseconds = dependencies.wallClock.currentTimestampInMilliseconds;
	const targetUrlValue = new URL(targetUrl);
	const targetPathname = targetUrlValue.pathname;

	dependencies.logInfo(
		"Loaded blog post mentions",
		createBlogPostMentionsLoadedLogProperties({
			durationMilliseconds: finishedAtMilliseconds - startedAtMilliseconds,
			hackerNewsState: hackerNewsLoadingResult.state,
			targetPathname,
			webmentionState: webmentionLoadingResult.state
		})
	);

	return {
		hackerNewsSectionModel: hackerNewsLoadingResult.sectionModel,
		webmentionSectionModel: webmentionLoadingResult.sectionModel
	};
}
