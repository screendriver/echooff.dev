import { isNull, isNumber, isString, isUndefined, isValidDate } from "@sindresorhus/is";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { recordFailedHackerNewsBuildMentionLoad, recordHackerNewsBuildMentionTotals } from "./build-mention-totals.ts";
import { parseHackerNewsApiUrl } from "./environment-variables.ts";
import { hackerNewsApiResponseSchema } from "./hacker-news-response-schema.ts";

export type HackerNewsMention = {
	readonly commentCount: number;
	readonly discussionUrl: string;
	readonly pointCount: number;
	readonly storyTitle: string;
	readonly submittedUrl: Maybe<string>;
	readonly visiblePublishedAt: Maybe<string>;
};

export type HackerNewsSectionModel = {
	readonly mentions: readonly HackerNewsMention[];
};

type HackerNewsApiHit = Record<string, unknown>;
type HackerNewsDependencies = {
	readonly fetch: typeof fetch;
};
type HackerNewsApiRequestUrlInput = {
	readonly hackerNewsApiUrl: URL;
	readonly targetUrl: string;
};

const emptyHackerNewsSectionModel = {
	mentions: []
} as const satisfies HackerNewsSectionModel;

function readString(objectValue: Record<string, unknown>, propertyName: string): Maybe<string> {
	const propertyValue = objectValue[propertyName];

	if (!isString(propertyValue)) {
		return nothing();
	}

	return just(propertyValue);
}

function readNumber(objectValue: Record<string, unknown>, propertyName: string): Maybe<number> {
	const propertyValue = objectValue[propertyName];

	if (!isNumber(propertyValue)) {
		return nothing();
	}

	return just(propertyValue);
}

function parseAbsoluteUrl(urlValue: string): Maybe<string> {
	try {
		return just(new URL(urlValue).toString());
	} catch {
		return nothing();
	}
}

function normalizeComparableUrl(urlValue: string): Maybe<string> {
	return parseAbsoluteUrl(urlValue).map((absoluteUrlValue) => {
		const parsedUrl = new URL(absoluteUrlValue);

		return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`;
	});
}

function readValidAbsoluteUrl(objectValue: Record<string, unknown>, propertyName: string): Maybe<string> {
	return readString(objectValue, propertyName).andThen(parseAbsoluteUrl);
}

function validateDateTimeString(value: string): Maybe<string> {
	if (!isValidDate(new Date(value))) {
		return nothing();
	}

	return just(value);
}

function readHackerNewsApiHits(hackerNewsApiResponse: unknown): readonly HackerNewsApiHit[] {
	if (!hackerNewsApiResponseSchema.allows(hackerNewsApiResponse)) {
		return [];
	}

	const { hits } = hackerNewsApiResponseSchema.assert(hackerNewsApiResponse);

	if (isUndefined(hits)) {
		return [];
	}

	return hits.flatMap((hackerNewsApiHit) => {
		return [hackerNewsApiHit];
	});
}

function compareMentionsByVisiblePublishedAtDescending(
	firstMention: HackerNewsMention,
	secondMention: HackerNewsMention
): number {
	if (firstMention.visiblePublishedAt.isNothing && secondMention.visiblePublishedAt.isNothing) {
		return firstMention.discussionUrl.localeCompare(secondMention.discussionUrl);
	}

	if (firstMention.visiblePublishedAt.isNothing) {
		return 1;
	}

	if (secondMention.visiblePublishedAt.isNothing) {
		return -1;
	}

	const firstMentionPublishedAtValue = Date.parse(firstMention.visiblePublishedAt.value);
	const secondMentionPublishedAtValue = Date.parse(secondMention.visiblePublishedAt.value);

	if (firstMentionPublishedAtValue === secondMentionPublishedAtValue) {
		return firstMention.discussionUrl.localeCompare(secondMention.discussionUrl);
	}

	return secondMentionPublishedAtValue - firstMentionPublishedAtValue;
}

function readStoryTitle(hackerNewsApiHit: HackerNewsApiHit): Maybe<string> {
	return readString(hackerNewsApiHit, "title").or(readString(hackerNewsApiHit, "story_title"));
}

function readDiscussionUrl(hackerNewsApiHit: HackerNewsApiHit): Maybe<string> {
	const itemId = readString(hackerNewsApiHit, "objectID");

	if (itemId.isNothing) {
		return nothing();
	}

	return just(`https://news.ycombinator.com/item?id=${itemId.value}`);
}

function readComparableSubmittedUrl(hackerNewsApiHit: HackerNewsApiHit): Maybe<string> {
	return readValidAbsoluteUrl(hackerNewsApiHit, "url").andThen(normalizeComparableUrl);
}

function readCompleteMentionFields(hackerNewsApiHit: HackerNewsApiHit): {
	readonly commentCount: number;
	readonly discussionUrl: string;
	readonly pointCount: number;
	readonly storyTitle: string;
} | null {
	const discussionUrl = readDiscussionUrl(hackerNewsApiHit);
	const storyTitle = readStoryTitle(hackerNewsApiHit);
	const pointCount = readNumber(hackerNewsApiHit, "points");
	const commentCount = readNumber(hackerNewsApiHit, "num_comments");

	if (discussionUrl.isNothing || storyTitle.isNothing || pointCount.isNothing || commentCount.isNothing) {
		return null;
	}

	return {
		commentCount: commentCount.value,
		discussionUrl: discussionUrl.value,
		pointCount: pointCount.value,
		storyTitle: storyTitle.value
	};
}

function readMentionFromApiHit(targetUrl: string, hackerNewsApiHit: HackerNewsApiHit): Maybe<HackerNewsMention> {
	const targetComparableUrl = normalizeComparableUrl(targetUrl);
	const submittedUrl = readValidAbsoluteUrl(hackerNewsApiHit, "url");
	const submittedComparableUrl = readComparableSubmittedUrl(hackerNewsApiHit);

	if (targetComparableUrl.isNothing || submittedComparableUrl.isNothing) {
		return nothing();
	}

	if (submittedComparableUrl.value !== targetComparableUrl.value) {
		return nothing();
	}

	const completeMentionFields = readCompleteMentionFields(hackerNewsApiHit);

	if (isNull(completeMentionFields)) {
		return nothing();
	}

	return just({
		commentCount: completeMentionFields.commentCount,
		discussionUrl: completeMentionFields.discussionUrl,
		pointCount: completeMentionFields.pointCount,
		storyTitle: completeMentionFields.storyTitle,
		submittedUrl,
		visiblePublishedAt: readString(hackerNewsApiHit, "created_at").andThen(validateDateTimeString)
	});
}

export function createEmptyHackerNewsSectionModel(): HackerNewsSectionModel {
	return {
		mentions: []
	};
}

export function createHackerNewsApiRequestUrl(hackerNewsApiRequestUrlInput: HackerNewsApiRequestUrlInput): string {
	const { hackerNewsApiUrl, targetUrl } = hackerNewsApiRequestUrlInput;
	const apiRequestUrl = new URL(hackerNewsApiUrl);

	apiRequestUrl.searchParams.set("tags", "story");
	apiRequestUrl.searchParams.set("hitsPerPage", "100");
	apiRequestUrl.searchParams.set("query", targetUrl);

	return apiRequestUrl.toString();
}

export function parseHackerNewsApiResponse(targetUrl: string, hackerNewsApiResponse: unknown): HackerNewsSectionModel {
	const parsedMentions = readHackerNewsApiHits(hackerNewsApiResponse)
		.flatMap((hackerNewsApiHit) => {
			return readMentionFromApiHit(targetUrl, hackerNewsApiHit).match({
				Just: (mention) => {
					return [mention];
				},
				Nothing: () => {
					return [];
				}
			});
		})
		.toSorted(compareMentionsByVisiblePublishedAtDescending);

	return {
		...emptyHackerNewsSectionModel,
		mentions: parsedMentions
	};
}

export async function loadHackerNewsMentionsForTargetUrl(
	dependencies: HackerNewsDependencies,
	targetUrl: string
): Promise<HackerNewsSectionModel> {
	try {
		const hackerNewsApiUrl = parseHackerNewsApiUrl(
			import.meta.env.HACKER_NEWS_API_URL ?? "https://hn.algolia.com/api/v1/search_by_date"
		);
		const response = await dependencies.fetch(
			createHackerNewsApiRequestUrl({
				hackerNewsApiUrl,
				targetUrl
			})
		);

		if (!response.ok) {
			throw new Error(`Hacker News API request failed with status ${response.status}`);
		}

		const hackerNewsApiResponse: unknown = await response.json();
		const hackerNewsSectionModel = parseHackerNewsApiResponse(targetUrl, hackerNewsApiResponse);

		recordHackerNewsBuildMentionTotals(hackerNewsSectionModel);

		return hackerNewsSectionModel;
	} catch (error: unknown) {
		recordFailedHackerNewsBuildMentionLoad();
		throw error;
	}
}
