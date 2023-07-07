import test from "node:test";
import assert from "node:assert";
import { fake } from "sinon";
import { Factory } from "fishery";
import { stripIndent } from "common-tags";
import type { graphql as octokitGraphql, RequestParameters } from "@octokit/graphql/dist-types/types";
import { FetchGitHubStatisticsOptions, fetchGitHubStatistics } from "./graphql-query.js";

const fetchGitHubStatisticsOptionsFactory = Factory.define<FetchGitHubStatisticsOptions>(() => {
	const graphql = fake.resolves(undefined) as unknown as octokitGraphql;
	return {
		graphql,
		gitHubBaseUrl: new URL("https://example.com/"),
		gitHubLogin: "username",
		gitHubApiToken: "my-token",
	};
});

interface TestFetchGitHubStatisticsOptions {
	readonly requestParameter: keyof RequestParameters;
	readonly expectedRequestParameters: unknown;
}

function testFetchGitHubStatistics(options: TestFetchGitHubStatisticsOptions): () => Promise<void> {
	const { requestParameter, expectedRequestParameters } = options;

	return async () => {
		const graphql = fake.resolves<RequestParameters[]>(undefined);
		const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
			graphql: graphql as unknown as octokitGraphql,
		});

		await fetchGitHubStatistics(fetchGitHubStatisticsOptions);

		assert.strictEqual(graphql.callCount, 1);
		assert.deepStrictEqual(graphql.args[0]?.[0]?.[requestParameter], expectedRequestParameters);
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
