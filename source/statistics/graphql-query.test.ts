import { describe, it, expect, vi, type TestFunction } from "vitest";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import type { graphql as octokitGraphql, RequestParameters } from "@octokit/graphql/types";
import { type ExecuteGraphQLQueryOptions, executeGraphQLQuery } from "./graphql-query.ts";

const fetchGitHubStatisticsOptionsFactory = Factory.define<ExecuteGraphQLQueryOptions>(() => {
	const graphqlImplementation = vi
		.fn<(requestParameters: RequestParameters) => Promise<unknown>>()
		.mockResolvedValue(undefined);
	return {
		graphql: graphqlImplementation as unknown as octokitGraphql,
		gitHubBaseUrl: new URL("https://example.com/"),
		gitHubLogin: "username",
		gitHubApiToken: "my-token"
	};
});

type TestFetchGitHubStatisticsInput = {
	readonly requestParameter: keyof RequestParameters;
	readonly expectedRequestParameters: unknown;
};

function testExecuteGraphQLQuery(testInput: TestFetchGitHubStatisticsInput): TestFunction {
	const { requestParameter, expectedRequestParameters } = testInput;

	return async () => {
		const graphqlImplementation = vi
			.fn<(requestParameters: RequestParameters) => Promise<unknown>>()
			.mockResolvedValue(undefined);
		const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
			graphql: graphqlImplementation as unknown as octokitGraphql
		});

		await executeGraphQLQuery(fetchGitHubStatisticsOptions);
		const actualGraphqlCallCount = graphqlImplementation.mock.calls.length;
		const expectedGraphqlCallCount = 1;
		const actualRequestParameters = graphqlImplementation.mock.calls[0]?.[0]?.[requestParameter];

		expect(actualGraphqlCallCount).toBe(expectedGraphqlCallCount);
		expect(actualRequestParameters).toStrictEqual(expectedRequestParameters);
	};
}

describe("executeGraphQLQuery()", () => {
	it(
		"uses the correct GraphQL query",
		testExecuteGraphQLQuery({
			requestParameter: "query",
			expectedRequestParameters: stripIndent`query ($login: String!) {
            user(login: $login) {
                repositories(ownerAffiliations: OWNER, privacy: PUBLIC) {
                    totalCount
                }
                starredRepositories {
                    totalCount
                }
            }
        }`
		})
	);

	it(
		"uses the correct GitHub base URL and strips the trailing slash",
		testExecuteGraphQLQuery({
			requestParameter: "baseUrl",
			expectedRequestParameters: "https://example.com"
		})
	);

	it(
		"uses the correct GitHub login",
		testExecuteGraphQLQuery({
			requestParameter: "login",
			expectedRequestParameters: "username"
		})
	);

	it(
		"uses the correct GitHub API token",
		testExecuteGraphQLQuery({
			requestParameter: "headers",
			expectedRequestParameters: {
				authorization: "token my-token"
			}
		})
	);
});
