import { webmentionApiUrlInputSchema } from "./environment-variable-input-schema.js";

export function parseWebmentionApiUrl(webmentionApiUrlInput: unknown): URL {
	return new URL(webmentionApiUrlInputSchema.assert(webmentionApiUrlInput));
}
