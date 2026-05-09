import is from "@sindresorhus/is";
import { Maybe } from "true-myth";

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

function readRecord(value: unknown): Maybe<Record<string, unknown>> {
	if (!is.plainObject(value)) {
		return Maybe.nothing();
	}

	return Maybe.just(value);
}

function readString(objectValue: Record<string, unknown>, propertyName: string): Maybe<string> {
	const propertyValue = objectValue[propertyName];

	if (!is.string(propertyValue)) {
		return Maybe.nothing();
	}

	return Maybe.just(propertyValue);
}

function readNumber(objectValue: Record<string, unknown>, propertyName: string): Maybe<number> {
	const propertyValue = objectValue[propertyName];

	if (!is.number(propertyValue)) {
		return Maybe.nothing();
	}

	return Maybe.just(propertyValue);
}

function parseAbsoluteUrl(urlValue: string): Maybe<string> {
	try {
		return Maybe.just(new URL(urlValue).toString());
	} catch {
		return Maybe.nothing();
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
	if (!is.validDate(new Date(value))) {
		return Maybe.nothing();
	}

	return Maybe.just(value);
}

function readHackerNewsApiHits(hackerNewsApiResponse: unknown): readonly HackerNewsApiHit[] {
	const hackerNewsApiResponseRecord = readRecord(hackerNewsApiResponse);

	if (hackerNewsApiResponseRecord.isNothing) {
		return [];
	}

	const { hits } = hackerNewsApiResponseRecord.value;

	if (!is.array(hits)) {
		return [];
	}

	return hits.flatMap((hackerNewsApiHit) => {
		const hackerNewsApiHitRecord = readRecord(hackerNewsApiHit);

		return hackerNewsApiHitRecord.match({
			Just: (recordValue) => {
				return [recordValue];
			},
			Nothing: () => {
				return [];
			}
		});
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
		return Maybe.nothing();
	}

	return Maybe.just(`https://news.ycombinator.com/item?id=${itemId.value}`);
}

function readMentionFromApiHit(targetUrl: string, hackerNewsApiHit: HackerNewsApiHit): Maybe<HackerNewsMention> {
	const targetComparableUrl = normalizeComparableUrl(targetUrl);
	const submittedUrl = readValidAbsoluteUrl(hackerNewsApiHit, "url");
	const submittedComparableUrl = submittedUrl.andThen(normalizeComparableUrl);

	if (targetComparableUrl.isNothing || submittedComparableUrl.isNothing) {
		return Maybe.nothing();
	}

	if (submittedComparableUrl.value !== targetComparableUrl.value) {
		return Maybe.nothing();
	}

	const discussionUrl = readDiscussionUrl(hackerNewsApiHit);
	const storyTitle = readStoryTitle(hackerNewsApiHit);
	const pointCount = readNumber(hackerNewsApiHit, "points");
	const commentCount = readNumber(hackerNewsApiHit, "num_comments");

	if (discussionUrl.isNothing || storyTitle.isNothing || pointCount.isNothing || commentCount.isNothing) {
		return Maybe.nothing();
	}

	return Maybe.just({
		commentCount: commentCount.value,
		discussionUrl: discussionUrl.value,
		pointCount: pointCount.value,
		storyTitle: storyTitle.value,
		submittedUrl,
		visiblePublishedAt: readString(hackerNewsApiHit, "created_at").andThen(validateDateTimeString)
	});
}

function parseHackerNewsApiUrl(hackerNewsApiUrlInput: unknown): URL {
	if (!is.string(hackerNewsApiUrlInput)) {
		throw new Error("Hacker News API URL must be a string.");
	}

	try {
		return new URL(hackerNewsApiUrlInput);
	} catch {
		throw new Error("Hacker News API URL must be a valid absolute URL.");
	}
}

export function createEmptyHackerNewsSectionModel(): HackerNewsSectionModel {
	return {
		mentions: []
	};
}

export function createHackerNewsApiRequestUrl(
	hackerNewsApiRequestUrlInput: HackerNewsApiRequestUrlInput
): string {
	const { hackerNewsApiUrl, targetUrl } = hackerNewsApiRequestUrlInput;
	const apiRequestUrl = new URL(hackerNewsApiUrl);

	apiRequestUrl.searchParams.set("tags", "story");
	apiRequestUrl.searchParams.set("hitsPerPage", "100");
	apiRequestUrl.searchParams.set("query", targetUrl);

	return apiRequestUrl.toString();
}

export function parseHackerNewsApiResponse(
	targetUrl: string,
	hackerNewsApiResponse: unknown
): HackerNewsSectionModel {
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

	return parseHackerNewsApiResponse(targetUrl, hackerNewsApiResponse);
}
