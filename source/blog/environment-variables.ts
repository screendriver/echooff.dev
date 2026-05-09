import {
	hackerNewsApiUrlInputSchema,
	webmentionApiUrlInputSchema
} from "./environment-variable-input-schema.js";

export function parseHackerNewsApiUrl(hackerNewsApiUrlInput: unknown): URL {
	return new URL(hackerNewsApiUrlInputSchema.assert(hackerNewsApiUrlInput));
}

export function parseWebmentionApiUrl(webmentionApiUrlInput: unknown): URL {
	return new URL(webmentionApiUrlInputSchema.assert(webmentionApiUrlInput));
}
