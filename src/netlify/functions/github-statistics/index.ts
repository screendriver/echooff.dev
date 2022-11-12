import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import type { Handler } from "@netlify/functions";
import { graphql } from "@octokit/graphql";
import { gitHubBaseUrlSchema, gitHubLoginSchema, gitHubApiTokenSchema } from "./environment-variables.js";
import { fetchGitHubStatistics } from "./graphql-query";
import { gitHubStatisticsSchema } from "../../../github-statistics/github-statistics-schema";

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0
	});
}

export const handler: Handler = async () => {
	const transaction = Sentry.startTransaction({
		op: "fetch",
		name: "GitHubStatistics"
	});

	try {
		const gitHubStatisticsResponse = await fetchGitHubStatistics({
			graphql,
			gitHubBaseUrl: gitHubBaseUrlSchema.parse(process.env.GIT_HUB_API_BASE_URL),
			gitHubLogin: gitHubLoginSchema.parse(process.env.GIT_HUB_LOGIN),
			gitHubApiToken: gitHubApiTokenSchema.parse(process.env.GIT_HUB_API_TOKEN)
		});
		const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);

		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json; charset=utf-8"
			},
			body: JSON.stringify(gitHubStatistics)
		};
	} catch (error: unknown) {
		Sentry.captureException(error);

		return { statusCode: 500 };
	} finally {
		transaction.finish();
	}
};
