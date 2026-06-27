export function createDevelopmentEnvironmentFileContent(listeningAddress: string, lineBreak = "\n"): string {
	return [
		`GITHUB_API_BASE_URL=${listeningAddress}`,
		'GITHUB_LOGIN="foo"',
		'GITHUB_TOKEN="foo"',
		`WEBMENTION_API_URL="${listeningAddress}/webmentions"`,
		`HACKER_NEWS_API_URL="${listeningAddress}/hacker-news"`,
		`CONTACT_FORM_URL="${listeningAddress}/contact-form"`
	].join(lineBreak);
}
