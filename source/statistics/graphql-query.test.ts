import { describe, it, expect, type TestFunction } from "vitest";
import { fake } from "sinon";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import type { graphql as octokitGraphql, RequestParameters } from "@octokit/graphql/types";
import { type ExecuteGraphQLQueryOptions, executeGraphQLQuery } from "./graphql-query.js";

const fetchGitHubStatisticsOptionsFactory = Factory.define<ExecuteGraphQLQueryOptions>(() => {
	const graphql = fake.resolves(undefined) as unknown as octokitGraphql;
	return {
		graphql,
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
		const graphql = fake.resolves<readonly RequestParameters[]>(undefined);
		const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
			graphql: graphql as unknown as octokitGraphql
		});

		await executeGraphQLQuery(fetchGitHubStatisticsOptions);

		expect(graphql.callCount).toBe(1);
		expect(graphql.args[0]?.[0]?.[requestParameter]).toStrictEqual(expectedRequestParameters);
	};
}

describe("executeGraphQLQuery()", () => {
	it(
		"uses the correct GraphQL query",
		testExecuteGraphQLQuery({
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
