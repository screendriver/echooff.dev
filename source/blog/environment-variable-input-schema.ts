import { type } from "arktype";

export const hackerNewsApiUrlInputSchema = type("string.url");
export const webmentionApiUrlInputSchema = type("string.url");
export const mentionRuntimeEnvironmentInputSchema = type({
	"HACKER_NEWS_API_URL?": "string.url",
	"WEBMENTION_API_URL?": "string.url"
});
