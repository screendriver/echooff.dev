import { webmentionApiBaseUrlInputSchema } from "./environment-variable-input-schema.js";

export function parseWebmentionApiBaseUrl(webmentionApiBaseUrlInput: unknown): URL {
	return new URL(webmentionApiBaseUrlInputSchema.assert(webmentionApiBaseUrlInput));
}
