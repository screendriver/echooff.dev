import process from "node:process";
import { isArray, isNull, isNumber, isPlainObject, isString, isUndefined, isValidDate } from "@sindresorhus/is";
import { isJust, just, nothing, type Just, type Maybe } from "true-myth/maybe";
import { err, isOk, ok, type Ok, type Result } from "true-myth/result";
import { parseCachedMaybeString } from "./cached-maybe.ts";
import { parseRuntimeHackerNewsApiUrl } from "./environment-variables.ts";
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
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly timeoutMilliseconds: number;
};
type HackerNewsApiRequestUrlInput = {
	readonly hackerNewsApiUrl: URL;
	readonly targetUrl: string;
};
type CachedHackerNewsMentionFields = {
	readonly commentCount: Maybe<number>;
	readonly discussionUrl: Maybe<string>;
	readonly pointCount: Maybe<number>;
	readonly storyTitle: Maybe<string>;
	readonly submittedUrl: Result<Maybe<string>, TypeError>;
	readonly visiblePublishedAt: Result<Maybe<string>, TypeError>;
};
type CompleteCachedHackerNewsMentionFields = {
	readonly commentCount: Just<number>;
	readonly discussionUrl: Just<string>;
	readonly pointCount: Just<number>;
	readonly storyTitle: Just<string>;
	readonly submittedUrl: Ok<Maybe<string>, TypeError>;
	readonly visiblePublishedAt: Ok<Maybe<string>, TypeError>;
};

const emptyHackerNewsSectionModel: HackerNewsSectionModel = {
	mentions: []
};

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

function readArray(objectValue: Record<string, unknown>, propertyName: string): Maybe<readonly unknown[]> {
	const propertyValue = objectValue[propertyName];

	if (!isArray(propertyValue)) {
		return nothing();
	}

	return just(propertyValue);
}

function parseAbsoluteUrl(urlValue: string): Maybe<string> {
	try {
		const parsedUrl = new URL(urlValue);

		return just(parsedUrl.href);
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

function readRecord(value: unknown): Maybe<Record<string, unknown>> {
	if (!isPlainObject(value)) {
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

function parseCachedMaybeAbsoluteUrl(serializedMaybeValue: unknown): Result<Maybe<string>, TypeError> {
	const urlValue = parseCachedMaybeString(serializedMaybeValue);

	if (urlValue.isErr) {
		return urlValue;
	}

	return urlValue.value.match({
		Nothing() {
			return ok(nothing());
		},
		Just(value) {
			const absoluteUrl = parseAbsoluteUrl(value);

			if (absoluteUrl.isNothing) {
				return err(new TypeError("Cached Maybe Just value must be an absolute URL."));
			}

			return ok(just(absoluteUrl.value));
		}
	});
}

function parseCachedMaybeDateTimeString(serializedMaybeValue: unknown): Result<Maybe<string>, TypeError> {
	const dateTimeValue = parseCachedMaybeString(serializedMaybeValue);

	if (dateTimeValue.isErr) {
		return dateTimeValue;
	}

	return dateTimeValue.value.match({
		Nothing() {
			return ok(nothing());
		},
		Just(value) {
			const dateTimeString = validateDateTimeString(value);

			if (dateTimeString.isNothing) {
				return err(new TypeError("Cached Maybe Just value must be a valid date-time string."));
			}

			return ok(just(dateTimeString.value));
		}
	});
}

function readCachedHackerNewsMentionFields(recordValue: Record<string, unknown>): CachedHackerNewsMentionFields {
	return {
		commentCount: readNumber(recordValue, "commentCount"),
		discussionUrl: readString(recordValue, "discussionUrl").andThen(parseAbsoluteUrl),
		pointCount: readNumber(recordValue, "pointCount"),
		storyTitle: readString(recordValue, "storyTitle"),
		submittedUrl: parseCachedMaybeAbsoluteUrl(recordValue.submittedUrl),
		visiblePublishedAt: parseCachedMaybeDateTimeString(recordValue.visiblePublishedAt)
	};
}

function hasCompleteCachedHackerNewsMentionFields(
	cachedHackerNewsMentionFields: CachedHackerNewsMentionFields
): cachedHackerNewsMentionFields is CompleteCachedHackerNewsMentionFields {
	const { commentCount, discussionUrl, pointCount, storyTitle, submittedUrl, visiblePublishedAt } =
		cachedHackerNewsMentionFields;
	const numberFields: readonly Maybe<number>[] = [commentCount, pointCount];
	const stringFields: readonly Maybe<string>[] = [discussionUrl, storyTitle];
	const cachedMaybeStringFields: readonly Result<Maybe<string>, TypeError>[] = [submittedUrl, visiblePublishedAt];

	return numberFields.every(isJust) && stringFields.every(isJust) && cachedMaybeStringFields.every(isOk);
}

function createCachedHackerNewsMention(
	cachedHackerNewsMentionFields: CachedHackerNewsMentionFields
): Maybe<HackerNewsMention> {
	if (!hasCompleteCachedHackerNewsMentionFields(cachedHackerNewsMentionFields)) {
		return nothing();
	}

	const { commentCount, discussionUrl, pointCount, storyTitle, submittedUrl, visiblePublishedAt } =
		cachedHackerNewsMentionFields;

	return just({
		commentCount: commentCount.value,
		discussionUrl: discussionUrl.value,
		pointCount: pointCount.value,
		storyTitle: storyTitle.value,
		submittedUrl: submittedUrl.value,
		visiblePublishedAt: visiblePublishedAt.value
	});
}

function parseCachedHackerNewsMention(serializedMention: unknown): Maybe<HackerNewsMention> {
	const mentionRecord = readRecord(serializedMention);

	return mentionRecord.andThen((recordValue) => {
		return createCachedHackerNewsMention(readCachedHackerNewsMentionFields(recordValue));
	});
}

function parseCachedHackerNewsMentions(serializedMentions: readonly unknown[]): Maybe<readonly HackerNewsMention[]> {
	const mentions: HackerNewsMention[] = [];

	for (const serializedMention of serializedMentions) {
		const mention = parseCachedHackerNewsMention(serializedMention);

		if (mention.isNothing) {
			return nothing();
		}

		mentions.push(mention.value);
	}

	return just(mentions);
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

	return apiRequestUrl.href;
}

export function parseHackerNewsApiResponse(targetUrl: string, hackerNewsApiResponse: unknown): HackerNewsSectionModel {
	const parsedMentions = readHackerNewsApiHits(hackerNewsApiResponse)
		.flatMap((hackerNewsApiHit) => {
			return readMentionFromApiHit(targetUrl, hackerNewsApiHit).match({
				Just(mention) {
					return [mention];
				},
				Nothing() {
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

export function parseCachedHackerNewsSectionModel(serializedSectionModel: unknown): Maybe<HackerNewsSectionModel> {
	const sectionModelRecord = readRecord(serializedSectionModel);

	return sectionModelRecord.andThen((recordValue) => {
		return readArray(recordValue, "mentions")
			.andThen(parseCachedHackerNewsMentions)
			.map((mentions) => {
				return {
					mentions
				};
			});
	});
}

export async function loadHackerNewsMentionsForTargetUrl(
	dependencies: HackerNewsDependencies,
	targetUrl: string
): Promise<HackerNewsSectionModel> {
	const hackerNewsApiUrl = parseRuntimeHackerNewsApiUrl(process.env);
	const response = await dependencies.fetch(
		createHackerNewsApiRequestUrl({
			hackerNewsApiUrl,
			targetUrl
		}),
		{
			signal: dependencies.createTimeoutSignal(dependencies.timeoutMilliseconds)
		}
	);

	if (!response.ok) {
		throw new Error(`Hacker News API request failed with status ${response.status}`);
	}

	const hackerNewsApiResponse: unknown = await response.json();
	return parseHackerNewsApiResponse(targetUrl, hackerNewsApiResponse);
}
