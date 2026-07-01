export type DevelopmentEnvironmentVariables = {
	readonly CONTACT_FORM_URL: string;
	readonly GITHUB_API_BASE_URL: string;
	readonly GITHUB_LOGIN: string;
	readonly GITHUB_TOKEN: string;
	readonly HACKER_NEWS_API_URL: string;
	readonly WEBMENTION_API_URL: string;
};

export function createDevelopmentEnvironmentVariables(listeningAddress: string): DevelopmentEnvironmentVariables {
	return {
		CONTACT_FORM_URL: `${listeningAddress}/contact-form`,
		GITHUB_API_BASE_URL: listeningAddress,
		GITHUB_LOGIN: "foo",
		GITHUB_TOKEN: "foo",
		HACKER_NEWS_API_URL: `${listeningAddress}/hacker-news`,
		WEBMENTION_API_URL: `${listeningAddress}/webmentions`
	};
}

export function createDevelopmentEnvironmentFileContent(listeningAddress: string, lineBreak = "\n"): string {
	const developmentEnvironmentVariables = createDevelopmentEnvironmentVariables(listeningAddress);

	return [
		`GITHUB_API_BASE_URL=${developmentEnvironmentVariables.GITHUB_API_BASE_URL}`,
		`GITHUB_LOGIN="${developmentEnvironmentVariables.GITHUB_LOGIN}"`,
		`GITHUB_TOKEN="${developmentEnvironmentVariables.GITHUB_TOKEN}"`,
		`WEBMENTION_API_URL="${developmentEnvironmentVariables.WEBMENTION_API_URL}"`,
		`HACKER_NEWS_API_URL="${developmentEnvironmentVariables.HACKER_NEWS_API_URL}"`,
		`CONTACT_FORM_URL="${developmentEnvironmentVariables.CONTACT_FORM_URL}"`
	].join(lineBreak);
}
