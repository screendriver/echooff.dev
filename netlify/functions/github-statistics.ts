import type { Handler } from '@netlify/functions';
import { graphql } from '@octokit/graphql';
import {
    gitHubBaseUrlSchema,
    gitHubLoginSchema,
    gitHubApiTokenSchema,
} from '../../src/components/statistics/environment-variables';
import { fetchGitHubStatistics } from '../../src/components/statistics/graphql-query';
import { gitHubStatisticsSchema } from '../../src/components/statistics/statistics-schema';

const handler: Handler = async () => {
    const gitHubStatisticsResponse = await fetchGitHubStatistics({
        graphql,
        gitHubBaseUrl: gitHubBaseUrlSchema.parse(process.env.GIT_HUB_API_BASE_URL),
        gitHubLogin: gitHubLoginSchema.parse(process.env.GIT_HUB_LOGIN),
        gitHubApiToken: gitHubApiTokenSchema.parse(process.env.GIT_HUB_API_TOKEN),
    });
    const gitHubStatistics = gitHubStatisticsSchema.parse(gitHubStatisticsResponse);

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(gitHubStatistics),
    };
};

export { handler };
