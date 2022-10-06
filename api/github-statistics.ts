import type { VercelRequest, VercelResponse } from "@vercel/node";
import { graphql } from "@octokit/graphql";
import { gitHubBaseUrlSchema, gitHubLoginSchema, gitHubApiTokenSchema } from "../src/statistics/environment-variables";
import { fetchGitHubStatistics } from "../src/statistics/graphql-query";
import { gitHubStatisticsSchema } from "../src/statistics/statistics-schema";

export default async function handler(_request: VercelRequest, response: VercelResponse): Promise<void> {
    const gitHubStatisticsResponse = await fetchGitHubStatistics({
        graphql,
        gitHubBaseUrl: gitHubBaseUrlSchema.parse(process.env.GIT_HUB_API_BASE_URL),
        gitHubLogin: gitHubLoginSchema.parse(process.env.GIT_HUB_LOGIN),
        gitHubApiToken: gitHubApiTokenSchema.parse(process.env.GIT_HUB_API_TOKEN),
    });
    const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);

    response.status(200).json(gitHubStatistics);
}
