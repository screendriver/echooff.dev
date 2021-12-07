import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { graphql } from '@octokit/graphql';
import { gitHubBaseUrlSchema, gitHubLoginSchema, gitHubApiTokenSchema } from '../../github/environment-variables';
import { fetchGitHubStatistics } from '../../github/graphql-query';
import { gitHubStatisticsSchema } from '../../github/statistics-schema';

export default async function (_request: GatsbyFunctionRequest, response: GatsbyFunctionResponse): Promise<void> {
    const gitHubStatisticsResponse = await fetchGitHubStatistics({
        graphql,
        gitHubBaseUrl: gitHubBaseUrlSchema.parse(process.env.GATSBY_GITHUB_BASE_URL),
        gitHubLogin: gitHubLoginSchema.parse(process.env.GATSBY_GITHUB_LOGIN),
        gitHubApiToken: gitHubApiTokenSchema.parse(process.env.GATSBY_GITHUB_API_TOKEN),
    });
    const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);
    response.json(gitHubStatistics);
}
