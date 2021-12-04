import { GraphQlResponse, graphql as octokitGraphql } from '@octokit/graphql/dist-types/types';

export interface FetchGitHubStatisticsOptions {
    readonly graphql: octokitGraphql;
    readonly gitHubBaseUrl: URL;
    readonly gitHubLogin: string;
    readonly gitHubApiToken: string;
}

export function fetchGitHubStatistics(options: FetchGitHubStatisticsOptions): GraphQlResponse<unknown> {
    const { graphql, gitHubBaseUrl, gitHubLogin, gitHubApiToken } = options;
    return graphql({
        query: `query ($login: String!) {
            user(login: $login) {
                repositories {
                    totalCount
                }
                starredRepositories {
                    totalCount
                }
            }
        }`,
        baseUrl: gitHubBaseUrl.toString(),
        login: gitHubLogin,
        headers: { authorization: `token ${gitHubApiToken}` },
    });
}
