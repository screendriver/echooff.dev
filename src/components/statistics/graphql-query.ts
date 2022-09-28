import type { GraphQlResponse, graphql as octokitGraphql } from '@octokit/graphql/dist-types/types';

export interface FetchGitHubStatisticsOptions {
    readonly graphql: octokitGraphql;
    readonly gitHubBaseUrl: URL;
    readonly gitHubLogin: string;
    readonly gitHubApiToken: string;
}

function stripTrailingSlash(url: string): string {
    if (url.endsWith('/')) {
        return url.slice(0, -1);
    }
    return url;
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
        baseUrl: stripTrailingSlash(gitHubBaseUrl.toString()),
        login: gitHubLogin,
        headers: { authorization: `token ${gitHubApiToken}` },
    });
}
