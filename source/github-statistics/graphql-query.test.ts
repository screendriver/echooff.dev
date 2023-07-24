import test from "ava";
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

const testFetchGitHubStatisticsMacro = test.macro<[keyof RequestParameters, unknown]>(
	async (t, requestParameter, expectedRequestParameters) => {
		const graphql = fake.resolves<readonly RequestParameters[]>(undefined);
		const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
			graphql: graphql as unknown as octokitGraphql,
		});

		await fetchGitHubStatistics(fetchGitHubStatisticsOptions);

		t.is(graphql.callCount, 1);
		t.deepEqual(graphql.args[0]?.[0]?.[requestParameter], expectedRequestParameters);
	},
);

test(
	"fetchGitHubStatistics() uses the correct GraphQL query",
	testFetchGitHubStatisticsMacro,
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
);

test(
	"fetchGitHubStatistics() uses the correct GitHub base URL and strips the trailing slash",
	testFetchGitHubStatisticsMacro,
	"baseUrl",
	"https://example.com",
);

test("fetchGitHubStatistics() uses the correct GitHub login", testFetchGitHubStatisticsMacro, "login", "username");

test("fetchGitHubStatistics() uses the correct GitHub API token", testFetchGitHubStatisticsMacro, "headers", {
	authorization: "token my-token",
});
