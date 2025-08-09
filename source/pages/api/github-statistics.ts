import { readFile } from "node:fs/promises";
import type { APIRoute } from "astro";
import { graphql } from "@octokit/graphql";
import { parse } from "valibot";
import { fetchGitHubStatistics } from "../../github-statistics/graphql-query";
import {
	gitHubApiTokenSchema,
	gitHubBaseUrlSchema,
	gitHubLoginSchema
} from "../../github-statistics/environment-variables";
import { gitHubStatisticsSchema } from "../../github-statistics/github-statistics-schema";

export const prerender = false;

export const GET: APIRoute = async () => {
	const gitHubApiTokenFile = parse(gitHubApiTokenSchema, import.meta.env.GITHUB_API_TOKEN_FILE);
	const gitHubApiToken = await readFile(gitHubApiTokenFile, { encoding: "utf8" });

	const gitHubStatisticsResponse = await fetchGitHubStatistics({
		graphql,
		gitHubBaseUrl: parse(gitHubBaseUrlSchema, import.meta.env.GITHUB_API_BASE_URL),
		gitHubLogin: parse(gitHubLoginSchema, import.meta.env.GITHUB_LOGIN),
		gitHubApiToken
	});
	const gitHubStatistics = parse(gitHubStatisticsSchema, gitHubStatisticsResponse);

	return new Response(JSON.stringify(gitHubStatistics), {
		headers: {
			"Content-Type": "application/json"
		}
	});
};
