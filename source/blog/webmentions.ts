import process from "node:process";
import { isArray, isNumber, isPlainObject, isString, isUndefined, isValidDate } from "@sindresorhus/is";
import { match } from "ts-pattern";
import { just, nothing, type Maybe } from "true-myth/maybe";
import { err, ok, type Result } from "true-myth/result";
import { parseCachedMaybeString } from "./cached-maybe.ts";
import { parseRuntimeWebmentionApiUrl } from "./environment-variables.ts";
import { webmentionApiResponseSchema } from "./webmention-response-schema.ts";

export type WebmentionAuthor = {
	readonly name: string;
	readonly photoUrl: Maybe<string>;
	readonly websiteUrl: Maybe<string>;
};

export type WebmentionReply = {
	readonly author: WebmentionAuthor;
	readonly content: Maybe<string>;
	readonly sourceUrl: string;
	readonly type: "mention" | "reply";
	readonly visiblePublishedAt: Maybe<string>;
};

export type WebmentionReactionSummary = {
	readonly bookmarkCount: number;
	readonly likeCount: number;
	readonly repostCount: number;
};

export type WebmentionSectionModel = {
	readonly reactions: WebmentionReactionSummary;
	readonly replies: readonly WebmentionReply[];
};

type WebmentionApiEntry = Record<string, unknown>;
type WebmentionReactionCountName = keyof WebmentionReactionSummary;
type IgnoredWebmentionEntry = {
	readonly kind: "ignore";
};
type ReactionWebmentionEntry = {
	readonly kind: "reaction";
	readonly reactionCountName: WebmentionReactionCountName;
};
type ReplyWebmentionEntry = {
	readonly kind: "reply";
	readonly reply: WebmentionReply;
};
type ParsedWebmentionEntry = IgnoredWebmentionEntry | ReactionWebmentionEntry | ReplyWebmentionEntry;
type WebmentionReplyInput = {
	readonly author: WebmentionAuthor;
	readonly content: Maybe<string>;
	readonly sourceUrl: string;
	readonly type: WebmentionReply["type"];
	readonly visiblePublishedAt: Maybe<string>;
};
type WebmentionDependencies = {
	readonly createTimeoutSignal: (timeoutMilliseconds: number) => AbortSignal;
	readonly fetch: typeof fetch;
	readonly timeoutMilliseconds: number;
};
type WebmentionApiRequestUrlInput = {
	readonly targetUrl: string;
	readonly webmentionApiUrl: URL;
};

const emptyWebmentionSectionModel: WebmentionSectionModel = {
	reactions: {
		bookmarkCount: 0,
		likeCount: 0,
		repostCount: 0
	},
	replies: []
};
const maximumDisplayedWebmentionContentLength = 280;

function readRecord(value: unknown): Maybe<Record<string, unknown>> {
	if (!isPlainObject(value)) {
		return nothing();
	}

	return just(value);
}

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
		const parsedUrl = new URL(urlValue);

		return just(parsedUrl.href);
	} catch {
		return nothing();
	}
}

function readValidAbsoluteUrl(objectValue: Record<string, unknown>, propertyName: string): Maybe<string> {
	return readString(objectValue, propertyName).andThen(parseAbsoluteUrl);
}

function normalizeWhitespace(textContent: string): Maybe<string> {
	const normalizedTextContent = textContent.replaceAll(/\s+/gu, " ").trim();

	if (normalizedTextContent.length === 0) {
		return nothing();
	}

	return just(normalizedTextContent);
}

function truncateTextContent(textContent: string): string {
	if (textContent.length <= maximumDisplayedWebmentionContentLength) {
		return textContent;
	}

	return `${textContent.slice(0, maximumDisplayedWebmentionContentLength - 1).trimEnd()}…`;
}

function normalizeAndTruncateTextContent(textContent: string): Maybe<string> {
	return normalizeWhitespace(textContent).map(truncateTextContent);
}

function isValidDateTimeString(value: string): boolean {
	return isValidDate(new Date(value));
}

function createWebmentionAuthor(
	authorDisplayName: string,
	photoUrl: Maybe<string>,
	websiteUrl: Maybe<string>
): WebmentionAuthor {
	return {
		name: authorDisplayName,
		photoUrl,
		websiteUrl
	};
}

function createWebmentionReply(webmentionReplyInput: WebmentionReplyInput): WebmentionReply {
	return webmentionReplyInput;
}

function readWebmentionEntries(webmentionApiResponse: unknown): readonly WebmentionApiEntry[] {
	if (!webmentionApiResponseSchema.allows(webmentionApiResponse)) {
		return [];
	}

	const { children } = webmentionApiResponseSchema.assert(webmentionApiResponse);
	if (isUndefined(children)) {
		return [];
	}

	return children;
}

function readWebmentionAuthor(webmentionEntry: WebmentionApiEntry, sourceUrl: string): WebmentionAuthor {
	const parsedSourceUrl = new URL(sourceUrl);
	const defaultAuthorDisplayName = parsedSourceUrl.hostname;
	const authorRecord = readRecord(webmentionEntry.author);

	return createWebmentionAuthor(
		authorRecord
			.andThen((recordValue) => {
				return readString(recordValue, "name");
			})
			.unwrapOr(defaultAuthorDisplayName),
		authorRecord.andThen((recordValue) => {
			return readValidAbsoluteUrl(recordValue, "photo");
		}),
		authorRecord.andThen((recordValue) => {
			return readValidAbsoluteUrl(recordValue, "url");
		})
	);
}

function readWebmentionContent(webmentionEntry: WebmentionApiEntry): Maybe<string> {
	const { content } = webmentionEntry;

	if (isString(content)) {
		return normalizeAndTruncateTextContent(content);
	}

	const contentRecord = readRecord(content);
	const summarizedContent = contentRecord.andThen((recordValue) => {
		return readString(recordValue, "summary");
	});

	if (summarizedContent.isJust) {
		return normalizeAndTruncateTextContent(summarizedContent.value);
	}

	return contentRecord
		.andThen((recordValue) => {
			return readString(recordValue, "text");
		})
		.andThen(normalizeAndTruncateTextContent);
}

function validateDateTimeString(value: string): Maybe<string> {
	if (!isValidDateTimeString(value)) {
		return nothing();
	}

	return just(value);
}

function parseCachedMaybeDateTimeString(serializedMaybeValue: unknown): Result<Maybe<string>, TypeError> {
	const dateTimeString = parseCachedMaybeString(serializedMaybeValue);

	if (dateTimeString.isErr) {
		return dateTimeString;
	}

	return dateTimeString.value.match({
		Nothing() {
			return ok(nothing());
		},
		Just(value) {
			const validatedValue = validateDateTimeString(value);

			if (validatedValue.isNothing) {
				return err(new TypeError("Cached Maybe Just value must be a valid date-time string."));
			}

			return ok(just(validatedValue.value));
		}
	});
}

function readVisiblePublishedAt(webmentionEntry: WebmentionApiEntry): Maybe<string> {
	return readString(webmentionEntry, "published")
		.andThen(validateDateTimeString)
		.or(readString(webmentionEntry, "wm-received").andThen(validateDateTimeString));
}

function compareWebmentionRepliesByVisiblePublishedAtDescending(
	firstWebmentionReply: WebmentionReply,
	secondWebmentionReply: WebmentionReply
): number {
	if (firstWebmentionReply.visiblePublishedAt.isNothing && secondWebmentionReply.visiblePublishedAt.isNothing) {
		return firstWebmentionReply.sourceUrl.localeCompare(secondWebmentionReply.sourceUrl);
	}

	if (firstWebmentionReply.visiblePublishedAt.isNothing) {
		return 1;
	}

	if (secondWebmentionReply.visiblePublishedAt.isNothing) {
		return -1;
	}

	const firstWebmentionReplyPublishedAtValue = Date.parse(firstWebmentionReply.visiblePublishedAt.value);
	const secondWebmentionReplyPublishedAtValue = Date.parse(secondWebmentionReply.visiblePublishedAt.value);

	if (firstWebmentionReplyPublishedAtValue === secondWebmentionReplyPublishedAtValue) {
		return firstWebmentionReply.sourceUrl.localeCompare(secondWebmentionReply.sourceUrl);
	}

	return secondWebmentionReplyPublishedAtValue - firstWebmentionReplyPublishedAtValue;
}

function parseCachedWebmentionReactionSummary(serializedReactionSummary: unknown): Maybe<WebmentionReactionSummary> {
	const reactionSummaryRecord = readRecord(serializedReactionSummary);

	return reactionSummaryRecord.andThen((recordValue) => {
		const bookmarkCount = readNumber(recordValue, "bookmarkCount");
		const likeCount = readNumber(recordValue, "likeCount");
		const repostCount = readNumber(recordValue, "repostCount");

		if (bookmarkCount.isNothing || likeCount.isNothing || repostCount.isNothing) {
			return nothing();
		}

		return just({
			bookmarkCount: bookmarkCount.value,
			likeCount: likeCount.value,
			repostCount: repostCount.value
		});
	});
}

function parseCachedWebmentionAuthor(serializedAuthor: unknown): Maybe<WebmentionAuthor> {
	const authorRecord = readRecord(serializedAuthor);

	return authorRecord.andThen((recordValue) => {
		const authorName = readString(recordValue, "name");
		const photoUrl = parseCachedMaybeString(recordValue.photoUrl);
		const websiteUrl = parseCachedMaybeString(recordValue.websiteUrl);

		if (authorName.isNothing || photoUrl.isErr || websiteUrl.isErr) {
			return nothing();
		}

		return just({
			name: authorName.value,
			photoUrl: photoUrl.value,
			websiteUrl: websiteUrl.value
		});
	});
}

function parseCachedWebmentionReplyType(serializedReplyType: unknown): Maybe<WebmentionReply["type"]> {
	if (serializedReplyType === "mention" || serializedReplyType === "reply") {
		return just(serializedReplyType);
	}

	return nothing();
}

function parseCachedWebmentionReply(serializedReply: unknown): Maybe<WebmentionReply> {
	const replyRecord = readRecord(serializedReply);

	return replyRecord.andThen((recordValue) => {
		const author = parseCachedWebmentionAuthor(recordValue.author);
		const content = parseCachedMaybeString(recordValue.content);
		const sourceUrl = readString(recordValue, "sourceUrl").andThen(parseAbsoluteUrl);
		const type = parseCachedWebmentionReplyType(recordValue.type);
		const visiblePublishedAt = parseCachedMaybeDateTimeString(recordValue.visiblePublishedAt);

		if (author.isNothing || content.isErr || sourceUrl.isNothing || type.isNothing || visiblePublishedAt.isErr) {
			return nothing();
		}

		return just({
			author: author.value,
			content: content.value,
			sourceUrl: sourceUrl.value,
			type: type.value,
			visiblePublishedAt: visiblePublishedAt.value
		});
	});
}

function parseCachedWebmentionReplies(serializedReplies: readonly unknown[]): Maybe<readonly WebmentionReply[]> {
	const replies: WebmentionReply[] = [];

	for (const serializedReply of serializedReplies) {
		const reply = parseCachedWebmentionReply(serializedReply);

		if (reply.isNothing) {
			return nothing();
		}

		replies.push(reply.value);
	}

	return just(replies);
}

function readReactionCountName(webmentionPropertyName: string): Maybe<WebmentionReactionCountName> {
	return match(webmentionPropertyName)
		.with("bookmark-of", () => {
			return just<WebmentionReactionCountName>("bookmarkCount");
		})
		.with("like-of", () => {
			return just<WebmentionReactionCountName>("likeCount");
		})
		.with("repost-of", () => {
			return just<WebmentionReactionCountName>("repostCount");
		})
		.otherwise(() => {
			return nothing();
		});
}

function readPublicSourceUrl(webmentionEntry: WebmentionApiEntry): Maybe<string> {
	if (webmentionEntry["wm-private"] === true) {
		return nothing();
	}

	return readValidAbsoluteUrl(webmentionEntry, "url");
}

function createReplyWebmentionEntry(
	webmentionEntry: WebmentionApiEntry,
	sourceUrl: string,
	webmentionType: WebmentionReply["type"]
): ReplyWebmentionEntry {
	return {
		kind: "reply",
		reply: createWebmentionReply({
			author: readWebmentionAuthor(webmentionEntry, sourceUrl),
			content: readWebmentionContent(webmentionEntry),
			sourceUrl,
			type: webmentionType,
			visiblePublishedAt: readVisiblePublishedAt(webmentionEntry)
		})
	};
}

function parseSourceWebmentionEntry(
	webmentionEntry: WebmentionApiEntry,
	sourceUrl: string,
	webmentionPropertyName: string
): ParsedWebmentionEntry {
	const reactionCountName = readReactionCountName(webmentionPropertyName);

	if (reactionCountName.isJust) {
		return {
			kind: "reaction",
			reactionCountName: reactionCountName.value
		};
	}

	return match(webmentionPropertyName)
		.with("mention-of", () => {
			return createReplyWebmentionEntry(webmentionEntry, sourceUrl, "mention");
		})
		.with("in-reply-to", () => {
			return createReplyWebmentionEntry(webmentionEntry, sourceUrl, "reply");
		})
		.otherwise(() => {
			return {
				kind: "ignore"
			};
		});
}

function parseWebmentionEntry(webmentionEntry: WebmentionApiEntry): ParsedWebmentionEntry {
	return readPublicSourceUrl(webmentionEntry).match({
		Just(sourceUrl) {
			return parseSourceWebmentionEntry(
				webmentionEntry,
				sourceUrl,
				readString(webmentionEntry, "wm-property").unwrapOr("")
			);
		},
		Nothing() {
			return {
				kind: "ignore"
			};
		}
	});
}

export function createEmptyWebmentionSectionModel(): WebmentionSectionModel {
	return {
		reactions: {
			...emptyWebmentionSectionModel.reactions
		},
		replies: emptyWebmentionSectionModel.replies
	};
}

export function createWebmentionApiRequestUrl(webmentionApiRequestUrlInput: WebmentionApiRequestUrlInput): string {
	const { targetUrl, webmentionApiUrl } = webmentionApiRequestUrlInput;
	const apiRequestUrl = new URL(webmentionApiUrl);

	apiRequestUrl.searchParams.set("per-page", "100");
	apiRequestUrl.searchParams.set("target", targetUrl);

	return apiRequestUrl.href;
}

export function parseWebmentionApiResponse(webmentionApiResponse: unknown): WebmentionSectionModel {
	const accumulatedWebmentionSectionModel = readWebmentionEntries(
		webmentionApiResponse
	).reduce<WebmentionSectionModel>((sectionModel, webmentionEntry) => {
		const parsedWebmentionEntry = parseWebmentionEntry(webmentionEntry);

		return match(parsedWebmentionEntry)
			.with({ kind: "ignore" }, () => {
				return sectionModel;
			})
			.with({ kind: "reaction" }, (reactionWebmentionEntry) => {
				return {
					...sectionModel,
					reactions: {
						...sectionModel.reactions,
						[reactionWebmentionEntry.reactionCountName]:
							sectionModel.reactions[reactionWebmentionEntry.reactionCountName] + 1
					}
				};
			})
			.with({ kind: "reply" }, (replyWebmentionEntry) => {
				return {
					...sectionModel,
					replies: [...sectionModel.replies, replyWebmentionEntry.reply]
				};
			})
			.exhaustive();
	}, createEmptyWebmentionSectionModel());

	return {
		...accumulatedWebmentionSectionModel,
		replies: accumulatedWebmentionSectionModel.replies.toSorted(
			compareWebmentionRepliesByVisiblePublishedAtDescending
		)
	};
}

export function parseCachedWebmentionSectionModel(serializedSectionModel: unknown): Maybe<WebmentionSectionModel> {
	const sectionModelRecord = readRecord(serializedSectionModel);

	return sectionModelRecord.andThen((recordValue) => {
		const reactions = parseCachedWebmentionReactionSummary(recordValue.reactions);
		const serializedReplies = recordValue.replies;

		if (reactions.isNothing || !isArray(serializedReplies)) {
			return nothing();
		}

		const replies = parseCachedWebmentionReplies(serializedReplies);

		if (replies.isNothing) {
			return nothing();
		}

		return just({
			reactions: reactions.value,
			replies: replies.value
		});
	});
}

export async function loadWebmentionsForTargetUrl(
	dependencies: WebmentionDependencies,
	targetUrl: string
): Promise<WebmentionSectionModel> {
	const webmentionApiUrl = parseRuntimeWebmentionApiUrl(process.env);
	const response = await dependencies.fetch(
		createWebmentionApiRequestUrl({
			targetUrl,
			webmentionApiUrl
		}),
		{
			signal: dependencies.createTimeoutSignal(dependencies.timeoutMilliseconds)
		}
	);

	if (!response.ok) {
		throw new Error(`Webmention API request failed with status ${response.status}`);
	}

	const webmentionApiResponse: unknown = await response.json();
	return parseWebmentionApiResponse(webmentionApiResponse);
}
