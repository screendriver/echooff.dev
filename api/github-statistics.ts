import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import type { VercelApiHandler } from "@vercel/node";
import { graphql } from "@octokit/graphql";
import { gitHubBaseUrlSchema, gitHubLoginSchema, gitHubApiTokenSchema } from "../src/statistics/environment-variables";
import { fetchGitHubStatistics } from "../src/statistics/graphql-query";
import { gitHubStatisticsSchema } from "../src/statistics/statistics-schema";

if (process.env.NODE_ENV === "production") {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0,
	});
}

const handler: VercelApiHandler = async (_request, response) => {
	const transaction = Sentry.startTransaction({
		op: "fetch",
		name: "GitHubStatistics",
	});

	try {
		const gitHubStatisticsResponse = await fetchGitHubStatistics({
			graphql,
			gitHubBaseUrl: gitHubBaseUrlSchema.parse(process.env.GIT_HUB_API_BASE_URL),
			gitHubLogin: gitHubLoginSchema.parse(process.env.GIT_HUB_LOGIN),
			gitHubApiToken: gitHubApiTokenSchema.parse(process.env.GIT_HUB_API_TOKEN),
		});
		const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);

		response.status(200).json(gitHubStatistics);
	} catch (error: unknown) {
		Sentry.captureException(error);
		throw error;
	} finally {
		transaction.finish();
	}
};

export default handler;
