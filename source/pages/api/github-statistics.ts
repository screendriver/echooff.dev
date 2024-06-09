import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { graphql } from "@octokit/graphql";
import { fetchGitHubStatistics } from "../../github-statistics/graphql-query";
import {
	gitHubApiTokenSchema,
	gitHubBaseUrlSchema,
	gitHubLoginSchema,
} from "../../github-statistics/environment-variables";
import { gitHubStatisticsSchema } from "../../github-statistics/github-statistics-schema";

export const prerender = false;

export const GET: APIRoute = async () => {
	const gitHubApiTokenFile = gitHubApiTokenSchema.parse(import.meta.env.GITHUB_API_TOKEN_FILE);
	const gitHubApiToken = await readFile(gitHubApiTokenFile, { encoding: "utf8" });

	const gitHubStatisticsResponse = await fetchGitHubStatistics({
		graphql,
		gitHubBaseUrl: gitHubBaseUrlSchema.parse(import.meta.env.GITHUB_API_BASE_URL),
		gitHubLogin: gitHubLoginSchema.parse(import.meta.env.GITHUB_LOGIN),
		gitHubApiToken,
	});
	const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);

	return new Response(JSON.stringify(gitHubStatistics), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
