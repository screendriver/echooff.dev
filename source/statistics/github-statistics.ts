import { readFile } from "node:fs/promises";
import { graphql } from "@octokit/graphql";
import { parse } from "valibot";
import { gitHubApiTokenSchema, gitHubBaseUrlSchema, gitHubLoginSchema } from "./environment-variables.js";
import { gitHubStatisticsSchema, type GitHubStatistics } from "./github-statistics-schema.js";
import { executeGraphQLQuery } from "./graphql-query.js";

export async function fetchGitHubStatistics(): Promise<GitHubStatistics> {
	const gitHubApiTokenFile = parse(gitHubApiTokenSchema, import.meta.env.GITHUB_API_TOKEN_FILE);
	const gitHubApiToken = await readFile(gitHubApiTokenFile, { encoding: "utf8" });

	const gitHubStatisticsResponse = await executeGraphQLQuery({
		graphql,
		gitHubBaseUrl: parse(gitHubBaseUrlSchema, import.meta.env.GITHUB_API_BASE_URL),
		gitHubLogin: parse(gitHubLoginSchema, import.meta.env.GITHUB_LOGIN),
		gitHubApiToken
	});
	const gitHubStatistics = parse(gitHubStatisticsSchema, gitHubStatisticsResponse);

	return gitHubStatistics;
}
