import { test, assert } from "vitest";
import { fake } from "sinon";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import type { graphql as octokitGraphql, RequestParameters } from "@octokit/graphql/dist-types/types";
import {
    fetchGitHubStatistics,
    FetchGitHubStatisticsOptions,
} from "../../../../src/components/statistics/graphql-query";

const fetchGitHubStatisticsOptionsFactory = Factory.define<FetchGitHubStatisticsOptions>(() => {
    const graphql = fake.resolves(undefined) as unknown as octokitGraphql;
    return {
        graphql,
        gitHubBaseUrl: new URL("https://example.com/"),
        gitHubLogin: "username",
        gitHubApiToken: "my-token",
    };
});

test.each<[string, keyof RequestParameters, unknown]>([
    [
        "GraphQL query",
        "query",
        stripIndent`query ($login: String!) {
            user(login: $login) {
                repositories {
                    totalCount
                }
                starredRepositories {
                    totalCount
                }
            }
        }`,
    ],
    ["GitHub base URL and strips the trailing slash", "baseUrl", "https://example.com"],
    ["GitHub login", "login", "username"],
    [
        "GitHub API token",
        "headers",
        {
            authorization: "token my-token",
        },
    ],
])("fetchGitHubStatistics() uses the correct %s", async (_testDescription, requestParameter, expected) => {
    const graphql = fake.resolves<RequestParameters[]>(undefined);
    const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
        graphql: graphql as unknown as octokitGraphql,
    });

    await fetchGitHubStatistics(fetchGitHubStatisticsOptions);

    assert.isTrue(graphql.calledOnce);
    assert.deepStrictEqual(graphql.args[0]?.[0]?.[requestParameter], expected);
});
