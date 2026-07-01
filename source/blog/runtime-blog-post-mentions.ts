import { isError } from "@sindresorhus/is";
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

export type BlogPostMentionsModel = {
	readonly hackerNewsSectionModel: HackerNewsSectionModel;
	readonly webmentionSectionModel: WebmentionSectionModel;
};

export type RuntimeMentionSectionLoadingDependencies<SectionModel> = {
	readonly cache: RuntimeMentionCache<SectionModel>;
	readonly cacheKey: string;
	readonly createEmptySectionModel: () => SectionModel;
	readonly loadFreshSectionModel: () => Promise<SectionModel>;
	readonly logWarning: (message: string, error: unknown) => void;
	readonly nowMilliseconds: number;
	readonly serviceName: string;
	readonly ttlMilliseconds: number;
};

type BlogPostMentionsDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly logWarning: (message: string, error: unknown) => void;
	readonly nowMilliseconds: () => number;
	readonly requestTimeoutMilliseconds: number;
	readonly runtimeMentionCacheTtlMilliseconds: number;
};
type MentionLoadingDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly timeoutMilliseconds: number;
};

export const runtimeMentionCacheTtlMilliseconds = 8 * 60 * 60 * 1000;
export const runtimeMentionRequestTimeoutMilliseconds = 5000;

const webmentionSectionModelCache = createRuntimeMentionCache<WebmentionSectionModel>();
const hackerNewsSectionModelCache = createRuntimeMentionCache<HackerNewsSectionModel>();

function normalizeUnknownError(error: unknown): Error {
	if (isError(error)) {
		return error;
	}

	return new Error(String(error));
}

function createMentionLoadingDependencies(dependencies: BlogPostMentionsDependencies): MentionLoadingDependencies {
	return {
		createTimeoutSignal: dependencies.createTimeoutSignal,
		fetch: dependencies.fetch,
		timeoutMilliseconds: dependencies.requestTimeoutMilliseconds
	};
}

export async function loadRuntimeMentionSectionModel<SectionModel>(
	dependencies: RuntimeMentionSectionLoadingDependencies<SectionModel>
): Promise<SectionModel> {
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
		return cacheReadResult.value;
	}

	const freshSectionModelResult = await tryTaskOrElse(normalizeUnknownError, loadFreshSectionModel);

	return freshSectionModelResult.match({
		Ok(freshSectionModel) {
			writeRuntimeMentionCache({
				cache,
				cacheKey,
				nowMilliseconds,
				value: freshSectionModel
			});

			return freshSectionModel;
		},
		Err(error) {
			logWarning(`Unable to load ${serviceName} mentions for "${cacheKey}" at runtime`, error);

			if (cacheReadResult.kind === "stale") {
				return cacheReadResult.value;
			}

			return createEmptySectionModel();
		}
	});
}

export async function loadBlogPostMentionsForTargetUrl(
	dependencies: BlogPostMentionsDependencies,
	targetUrl: string
): Promise<BlogPostMentionsModel> {
	const nowMilliseconds = dependencies.nowMilliseconds();
	const mentionLoadingDependencies = createMentionLoadingDependencies(dependencies);
	const [webmentionSectionModel, hackerNewsSectionModel] = await Promise.all([
		loadRuntimeMentionSectionModel({
			cache: webmentionSectionModelCache,
			cacheKey: targetUrl,
			createEmptySectionModel: createEmptyWebmentionSectionModel,
			async loadFreshSectionModel() {
				return loadWebmentionsForTargetUrl(mentionLoadingDependencies, targetUrl);
			},
			logWarning: dependencies.logWarning,
			nowMilliseconds,
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
			nowMilliseconds,
			serviceName: "Hacker News",
			ttlMilliseconds: dependencies.runtimeMentionCacheTtlMilliseconds
		})
	]);

	return {
		hackerNewsSectionModel,
		webmentionSectionModel
	};
}
