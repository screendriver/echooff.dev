import React from 'react';
import test from 'ava';
import { fake } from 'sinon';
import { cleanup, render, waitFor, screen } from '@testing-library/react';
import { Factory } from 'fishery';
import type KyInterface from 'ky';
import { GitHubStatistics } from '../../../src/statistics/statistics-schema';
import { Statistics } from '../../../src/statistics/Statistics';
import {
    createStatisticsStateMachine,
    StatisticsMachineDependencies,
    StatisticsStateMachine,
} from '../../../src/statistics/state-machine';

const gitHubStatisticsFactory = Factory.define<GitHubStatistics>(() => {
    return {
        user: {
            repositories: {
                totalCount: 7,
            },
            starredRepositories: {
                totalCount: 42,
            },
        },
    };
});

function createStatisticsTestStateMachine(fetchGitHubStatistics?: () => Promise<unknown>): StatisticsStateMachine {
    const ky = fake.rejects('') as unknown as typeof KyInterface;
    const dependencies: StatisticsMachineDependencies = { ky, currentTimestamp: new Date() };
    return createStatisticsStateMachine(dependencies).withConfig({
        services: {
            fetchGitHubStatistics() {
                if (fetchGitHubStatistics !== undefined) {
                    return fetchGitHubStatistics();
                }
                const gitHubStatistics = gitHubStatisticsFactory.build();
                return Promise.resolve(gitHubStatistics);
            },
        },
    });
}

test.afterEach(cleanup);

test.serial('shows "Loading" while fetching GitHub statistics', (t) => {
    const statisticsStateMachine = createStatisticsTestStateMachine();
    render(<Statistics statisticsStateMachine={statisticsStateMachine} />);

    t.not(screen.queryByText('Loading'), null);
});

test.serial('shows GitHub statistics after GitHub statistics were fetched', async (t) => {
    const statisticsStateMachine = createStatisticsTestStateMachine();
    render(<Statistics statisticsStateMachine={statisticsStateMachine} />);

    await waitFor(() => screen.findByText('Some Stats'));

    t.pass();
});

test.serial('shows "Failed" when fetching GitHub statistics failed', async (t) => {
    const fetchGitHubStatistics = () => Promise.reject('');
    const statisticsStateMachine = createStatisticsTestStateMachine(fetchGitHubStatistics);
    render(<Statistics statisticsStateMachine={statisticsStateMachine} />);

    await waitFor(() => screen.findByText('Failed'));

    t.pass();
});
