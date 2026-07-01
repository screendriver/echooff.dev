import { isError } from "@sindresorhus/is";
import { match } from "ts-pattern";
import { tryOrElse as tryTaskOrElse } from "true-myth/task";
import {
	createEmptyHackerNewsSectionModel,
	type HackerNewsSectionModel,
	loadHackerNewsMentionsForTargetUrl
} from "./hacker-news-mentions.ts";
import {
	createRuntimeMentionCache,
	readRuntimeMentionCache,
	type RuntimeMentionCache,
	writeRuntimeMentionCache
} from "./runtime-mention-cache.ts";
import {
	createEmptyWebmentionSectionModel,
	loadWebmentionsForTargetUrl,
	type WebmentionSectionModel
} from "./webmentions.ts";
import type { RuntimeLogProperties } from "./runtime-logger.ts";

export type BlogPostMentionsModel = {
	readonly hackerNewsSectionModel: HackerNewsSectionModel;
	readonly webmentionSectionModel: WebmentionSectionModel;
};

export type RuntimeMentionSectionLoadState = "empty_after_error" | "fresh" | "refreshed" | "stale_after_error";

export type RuntimeMentionSectionLoadingResult<SectionModel> = {
	readonly sectionModel: SectionModel;
	readonly state: RuntimeMentionSectionLoadState;
};

export type RuntimeMentionSectionLoadingDependencies<SectionModel> = {
	readonly cache: RuntimeMentionCache<SectionModel>;
	readonly cacheKey: string;
	readonly createEmptySectionModel: () => SectionModel;
	readonly loadFreshSectionModel: () => Promise<SectionModel>;
	readonly logWarning: (message: string, error: unknown, properties: RuntimeLogProperties) => void;
	readonly nowMilliseconds: number;
	readonly serviceName: string;
	readonly ttlMilliseconds: number;
};

type BlogPostMentionsDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly logInfo: (message: string, properties: RuntimeLogProperties) => void;
	readonly logWarning: (message: string, error: unknown, properties: RuntimeLogProperties) => void;
	readonly nowMilliseconds: () => number;
	readonly requestTimeoutMilliseconds: number;
	readonly runtimeMentionCacheTtlMilliseconds: number;
};
type MentionLoadingDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly timeoutMilliseconds: number;
};
type BlogPostMentionsLoadedLogPropertiesInput = {
	readonly durationMilliseconds: number;
	readonly hackerNewsState: RuntimeMentionSectionLoadState;
	readonly targetPathname: string;
	readonly webmentionState: RuntimeMentionSectionLoadState;
};

export const runtimeMentionCacheTtlMilliseconds = 8 * 60 * 60 * 1000;
export const runtimeMentionRequestTimeoutMilliseconds = 5000;

const webmentionSectionModelCache = createRuntimeMentionCache<WebmentionSectionModel>();
const hackerNewsSectionModelCache = createRuntimeMentionCache<HackerNewsSectionModel>();

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

function didMentionSectionLoadUseErrorFallback(state: RuntimeMentionSectionLoadState): boolean {
	return match(state)
		.with("empty_after_error", "stale_after_error", () => {
			return true;
		})
		.otherwise(() => {
			return false;
		});
}

function createBlogPostMentionsLoadStatus(
	webmentionState: RuntimeMentionSectionLoadState,
	hackerNewsState: RuntimeMentionSectionLoadState
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

export async function loadRuntimeMentionSectionModel<SectionModel>(
	dependencies: RuntimeMentionSectionLoadingDependencies<SectionModel>
): Promise<RuntimeMentionSectionLoadingResult<SectionModel>> {
	const {
		cache,
		cacheKey,
		createEmptySectionModel,
		loadFreshSectionModel,
		logWarning,
		nowMilliseconds,
		serviceName,
		ttlMilliseconds
	} = dependencies;
	const cacheReadResult = readRuntimeMentionCache({
		cache,
		cacheKey,
		nowMilliseconds,
		ttlMilliseconds
	});

	if (cacheReadResult.kind === "fresh") {
		return {
			sectionModel: cacheReadResult.value,
			state: "fresh"
		};
	}

	const freshSectionModelResult = await tryTaskOrElse(normalizeUnknownError, loadFreshSectionModel);

	return freshSectionModelResult.match<RuntimeMentionSectionLoadingResult<SectionModel>>({
		Ok(freshSectionModel) {
			writeRuntimeMentionCache({
				cache,
				cacheKey,
				nowMilliseconds,
				value: freshSectionModel
			});

			return {
				sectionModel: freshSectionModel,
				state: "refreshed"
			};
		},
		Err(error) {
			logWarning(`Unable to load ${serviceName} mentions at runtime`, error, {
				cacheKey,
				event: "blog_post_mentions_section_load_failed",
				serviceName
			});

			return match(cacheReadResult)
				.with({ kind: "stale" }, (staleCacheReadResult) => {
					return {
						sectionModel: staleCacheReadResult.value,
						state: "stale_after_error" as const
					};
				})
				.otherwise(() => {
					return {
						sectionModel: createEmptySectionModel(),
						state: "empty_after_error" as const
					};
				});
		}
	});
}

export async function loadBlogPostMentionsForTargetUrl(
	dependencies: BlogPostMentionsDependencies,
	targetUrl: string
): Promise<BlogPostMentionsModel> {
	const startedAtMilliseconds = dependencies.nowMilliseconds();
	const mentionLoadingDependencies = createMentionLoadingDependencies(dependencies);
	const [webmentionLoadingResult, hackerNewsLoadingResult] = await Promise.all([
		loadRuntimeMentionSectionModel({
			cache: webmentionSectionModelCache,
			cacheKey: targetUrl,
			createEmptySectionModel: createEmptyWebmentionSectionModel,
			async loadFreshSectionModel() {
				return loadWebmentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
			},
			logWarning: dependencies.logWarning,
			nowMilliseconds: startedAtMilliseconds,
			serviceName: "Webmention",
			ttlMilliseconds: dependencies.runtimeMentionCacheTtlMilliseconds
		}),
		loadRuntimeMentionSectionModel({
			cache: hackerNewsSectionModelCache,
			cacheKey: targetUrl,
			createEmptySectionModel: createEmptyHackerNewsSectionModel,
			async loadFreshSectionModel() {
				return loadHackerNewsMentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
			},
			logWarning: dependencies.logWarning,
			nowMilliseconds: startedAtMilliseconds,
			serviceName: "Hacker News",
			ttlMilliseconds: dependencies.runtimeMentionCacheTtlMilliseconds
		})
	]);
	const finishedAtMilliseconds = dependencies.nowMilliseconds();
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
