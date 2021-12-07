import test from 'ava';
import { fake, SinonSpy } from 'sinon';
import { Factory } from 'fishery';
import { graphql as octokitGraphql, RequestParameters } from '@octokit/graphql/dist-types/types';
import { fetchGitHubStatistics, FetchGitHubStatisticsOptions } from '../../../src/statistics/graphql-query';

const fetchGitHubStatisticsOptionsFactory = Factory.define<FetchGitHubStatisticsOptions>(() => {
    const graphql = fake.resolves(undefined) as unknown as octokitGraphql;
    return {
        graphql,
        gitHubBaseUrl: new URL('https://example.com/'),
        gitHubLogin: 'username',
        gitHubApiToken: 'my-token',
    };
});

const fetchGitHubStatisticsMacro = test.macro<[input: keyof RequestParameters, expected: unknown]>(
    async (t, input, expected) => {
        const graphql = fake.resolves(undefined) as SinonSpy<RequestParameters[]>;
        const fetchGitHubStatisticsOptions = fetchGitHubStatisticsOptionsFactory.build({
            graphql: graphql as unknown as octokitGraphql,
        });

        await fetchGitHubStatistics(fetchGitHubStatisticsOptions);

        t.true(graphql.calledOnce);
        t.deepEqual(graphql.args[0]?.[0]?.[input], expected);
    },
);

test(
    'fetchGitHubStatistics() uses the correct GraphQL query',
    fetchGitHubStatisticsMacro,
    'query',
    `query ($login: String!) {
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
    'fetchGitHubStatistics() uses the correct GitHub base URL and strips the trailing slash',
    fetchGitHubStatisticsMacro,
    'baseUrl',
    'https://example.com',
);

test('fetchGitHubStatistics() uses the correct GitHub login', fetchGitHubStatisticsMacro, 'login', 'username');

test('fetchGitHubStatistics() uses the correct GitHub API token', fetchGitHubStatisticsMacro, 'headers', {
    authorization: 'token my-token',
});
