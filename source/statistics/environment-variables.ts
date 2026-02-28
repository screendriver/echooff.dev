import {
	gitHubApiTokenInputSchema,
	gitHubBaseUrlInputSchema,
	gitHubLoginInputSchema
} from "./environment-variable-input-schema.js";

export function parseGitHubBaseUrl(gitHubBaseUrlInput: unknown): URL {
	return new URL(gitHubBaseUrlInputSchema.assert(gitHubBaseUrlInput));
}

export function parseGitHubLogin(gitHubLoginInput: unknown): string {
	return gitHubLoginInputSchema.assert(gitHubLoginInput);
}

export function parseGitHubApiToken(gitHubApiTokenInput: unknown): string {
	return gitHubApiTokenInputSchema.assert(gitHubApiTokenInput);
}
