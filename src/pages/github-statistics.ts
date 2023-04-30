import "@sentry/tracing";
import * as Sentry from "@sentry/node";
import type { APIRoute } from "astro";
import { fetchGitHubStatistics } from "../github-statistics/graphql-query";
import { graphql } from "@octokit/graphql";
import {
	gitHubBaseUrlSchema,
	gitHubLoginSchema,
	gitHubApiTokenSchema
} from "../github-statistics/environment-variables";
import { gitHubStatisticsSchema } from "../github-statistics/github-statistics-schema";

export const prerender = false;

if (import.meta.env.PROD) {
	Sentry.init({
		dsn: import.meta.env.SENTRY_DSN as string | undefined,
		tracesSampleRate: 1.0
	});
}

export const get: APIRoute = async () => {
	const transaction = Sentry.startTransaction({
		op: "fetch",
		name: "GitHubStatistics"
	});

	try {
		const gitHubStatisticsResponse = await fetchGitHubStatistics({
			graphql,
			gitHubBaseUrl: gitHubBaseUrlSchema.parse(import.meta.env.GIT_HUB_API_BASE_URL),
			gitHubLogin: gitHubLoginSchema.parse(import.meta.env.GIT_HUB_LOGIN),
			gitHubApiToken: gitHubApiTokenSchema.parse(import.meta.env.GIT_HUB_API_TOKEN)
		});
		const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);

		return new Response(JSON.stringify(gitHubStatistics), {
			status: 200,
			headers: {
				"Content-Type": "application/json; charset=utf-8"
			}
		});
	} catch (error: unknown) {
		Sentry.captureException(error);

		return new Response(undefined, { status: 500 });
	} finally {
		transaction?.finish();
	}
};
