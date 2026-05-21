import { graphql } from "@octokit/graphql";
import { parseGitHubApiToken, parseGitHubBaseUrl, parseGitHubLogin } from "./environment-variables.ts";
import { gitHubStatisticsResponseSchema } from "./github-statistics-response-schema.ts";
import { executeGraphQLQuery } from "./graphql-query.ts";

export type GitHubStatistics = {
	user: {
		repositories: {
			totalCount: number;
		};
		starredRepositories: {
			totalCount: number;
		};
	};
};

export function parseGitHubStatistics(gitHubStatisticsResponse: unknown): GitHubStatistics {
	const validatedGitHubStatisticsResponse = gitHubStatisticsResponseSchema.assert(gitHubStatisticsResponse);

	return {
		user: {
			repositories: {
				totalCount: validatedGitHubStatisticsResponse.user.repositories.totalCount
			},
			starredRepositories: {
				totalCount: validatedGitHubStatisticsResponse.user.starredRepositories.totalCount
			}
		}
	};
}

export async function fetchGitHubStatistics(): Promise<GitHubStatistics> {
	const gitHubApiToken = parseGitHubApiToken(import.meta.env.GITHUB_TOKEN);

	const gitHubStatisticsResponse = await executeGraphQLQuery({
		graphql,
		gitHubBaseUrl: parseGitHubBaseUrl(import.meta.env.GITHUB_API_BASE_URL),
		gitHubLogin: parseGitHubLogin(import.meta.env.GITHUB_LOGIN),
		gitHubApiToken
	});
	const gitHubStatistics = parseGitHubStatistics(gitHubStatisticsResponse);

	return gitHubStatistics;
}
