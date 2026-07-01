import {
	hackerNewsApiUrlInputSchema,
	mentionRuntimeEnvironmentInputSchema,
	webmentionApiUrlInputSchema
} from "./environment-variable-input-schema.ts";

export const defaultHackerNewsApiUrl = "https://hn.algolia.com/api/v1/search_by_date";
export const defaultWebmentionApiUrl = "https://webmention.io/api/mentions.jf2";

type MentionRuntimeEnvironment = {
	readonly HACKER_NEWS_API_URL?: string;
	readonly WEBMENTION_API_URL?: string;
};

export function parseHackerNewsApiUrl(hackerNewsApiUrlInput: unknown): URL {
	return new URL(hackerNewsApiUrlInputSchema.assert(hackerNewsApiUrlInput));
}

export function parseWebmentionApiUrl(webmentionApiUrlInput: unknown): URL {
	return new URL(webmentionApiUrlInputSchema.assert(webmentionApiUrlInput));
}

function parseMentionRuntimeEnvironment(mentionRuntimeEnvironmentInput: unknown): MentionRuntimeEnvironment {
	return mentionRuntimeEnvironmentInputSchema.assert(mentionRuntimeEnvironmentInput);
}

export function parseRuntimeHackerNewsApiUrl(mentionRuntimeEnvironmentInput: unknown): URL {
	const mentionRuntimeEnvironment = parseMentionRuntimeEnvironment(mentionRuntimeEnvironmentInput);

	return parseHackerNewsApiUrl(mentionRuntimeEnvironment.HACKER_NEWS_API_URL ?? defaultHackerNewsApiUrl);
}

export function parseRuntimeWebmentionApiUrl(mentionRuntimeEnvironmentInput: unknown): URL {
	const mentionRuntimeEnvironment = parseMentionRuntimeEnvironment(mentionRuntimeEnvironmentInput);

	return parseWebmentionApiUrl(mentionRuntimeEnvironment.WEBMENTION_API_URL ?? defaultWebmentionApiUrl);
}
