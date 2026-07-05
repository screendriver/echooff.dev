import assert from "node:assert";
import { suite, test } from "mocha";
import { fake } from "sinon";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import type { graphql as octokitGraphql, RequestParameters } from "@octokit/graphql/types";
import { type ExecuteGraphQLQueryOptions, executeGraphQLQuery } from "./graphql-query.ts";

const fetchGitHubStatisticsOptionsFactory = Factory.define<ExecuteGraphQLQueryOptions>(() => {
	const graphqlImplementation = fake.resolves(undefined);

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

type ExecuteGraphQLQueryTestFunction = () => Promise<void>;

function testExecuteGraphQLQuery(testInput: TestFetchGitHubStatisticsInput): ExecuteGraphQLQueryTestFunction {
	const { requestParameter, expectedRequestParameters } = testInput;

	return async function () {
		const graphqlImplementation = fake.resolves(undefined);
		const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
			graphql: graphqlImplementation as unknown as octokitGraphql
		});

		await executeGraphQLQuery(fetchGitHubStatisticsOptions);
		const actualGraphqlCallCount = graphqlImplementation.callCount;
		const expectedGraphqlCallCount = 1;
		const actualRequestParameters = (graphqlImplementation.firstCall.args[0] as RequestParameters)[
			requestParameter
		];

		assert.strictEqual(actualGraphqlCallCount, expectedGraphqlCallCount);
		assert.deepStrictEqual(actualRequestParameters, expectedRequestParameters);
	};
}

suite("executeGraphQLQuery()", function () {
	test(
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

	test(
		"uses the correct GitHub base URL and strips the trailing slash",
		testExecuteGraphQLQuery({
			requestParameter: "baseUrl",
			expectedRequestParameters: "https://example.com"
		})
	);

	test(
		"uses the correct GitHub login",
		testExecuteGraphQLQuery({
			requestParameter: "login",
			expectedRequestParameters: "username"
		})
	);

	test(
		"uses the correct GitHub API token",
		testExecuteGraphQLQuery({
			requestParameter: "headers",
			expectedRequestParameters: {
				authorization: "token my-token"
			}
		})
	);
});
