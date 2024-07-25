import { test, expect, type TestFunction } from "vitest";
import { fake } from "sinon";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import type { graphql as octokitGraphql, RequestParameters } from "@octokit/graphql/types";
import type { FetchGitHubStatisticsOptions } from "./graphql-query.js";
import { fetchGitHubStatistics } from "./graphql-query.js";

const fetchGitHubStatisticsOptionsFactory = Factory.define<FetchGitHubStatisticsOptions>(() => {
	const graphql = fake.resolves(undefined) as unknown as octokitGraphql;
	return {
		graphql,
		gitHubBaseUrl: new URL("https://example.com/"),
		gitHubLogin: "username",
		gitHubApiToken: "my-token",
	};
});

type TestFetchGitHubStatisticsInput = {
	readonly requestParameter: keyof RequestParameters;
	readonly expectedRequestParameters: unknown;
};

function testFetchGitHubStatistics(testInput: TestFetchGitHubStatisticsInput): TestFunction {
	const { requestParameter, expectedRequestParameters } = testInput;

	return async () => {
		const graphql = fake.resolves<readonly RequestParameters[]>(undefined);
		const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
			graphql: graphql as unknown as octokitGraphql,
		});

		await fetchGitHubStatistics(fetchGitHubStatisticsOptions);

		expect(graphql.callCount).toBe(1);
		expect(graphql.args[0]?.[0]?.[requestParameter]).toStrictEqual(expectedRequestParameters);
	};
}

test(
	"fetchGitHubStatistics() uses the correct GraphQL query",
	testFetchGitHubStatistics({
		requestParameter: "query",
		expectedRequestParameters: stripIndent`query ($login: String!) {
            user(login: $login) {
                repositories {
                    totalCount
                }
                starredRepositories {
                    totalCount
                }
            }
        }`,
	}),
);

test(
	"fetchGitHubStatistics() uses the correct GitHub base URL and strips the trailing slash",
	testFetchGitHubStatistics({
		requestParameter: "baseUrl",
		expectedRequestParameters: "https://example.com",
	}),
);

test(
	"fetchGitHubStatistics() uses the correct GitHub login",
	testFetchGitHubStatistics({
		requestParameter: "login",
		expectedRequestParameters: "username",
	}),
);

test(
	"fetchGitHubStatistics() uses the correct GitHub API token",
	testFetchGitHubStatistics({
		requestParameter: "headers",
		expectedRequestParameters: {
			authorization: "token my-token",
		},
	}),
);
