import React from 'react';
import test from 'ava';
import { fake } from 'sinon';
import { cleanup, render, waitFor, screen } from '@testing-library/react';
import { Factory } from 'fishery';
import type KyInterface from 'ky';
import { GitHubStatistics } from '../../../src/github/statistics-schema';
import { GitHubStatistics as GitHubStatisticsComponent } from '../../../src/github/GitHubStatistics';
import {
    createGitHubStateMachine,
    GitHubMachineDependencies,
    GitHubStateMachine,
} from '../../../src/github/state-machine';

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

function createGitHubTestStateMachine(fetchGitHubStatistics?: () => Promise<unknown>): GitHubStateMachine {
    const ky = fake.rejects('') as unknown as typeof KyInterface;
    const dependencies: GitHubMachineDependencies = { ky };
    return createGitHubStateMachine(dependencies).withConfig({
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
    const gitHubStateMachine = createGitHubTestStateMachine();
    render(<GitHubStatisticsComponent gitHubStateMachine={gitHubStateMachine} />);

    t.not(screen.queryByText('Loading'), null);
});

test.serial('shows GitHub statistics after GitHub statistics were fetched', async (t) => {
    const gitHubStateMachine = createGitHubTestStateMachine();
    render(<GitHubStatisticsComponent gitHubStateMachine={gitHubStateMachine} />);

    await waitFor(() => screen.findByText('Some Stats'));

    t.pass();
});

test.serial('shows "Failed" when fetching GitHub statistics failed', async (t) => {
    const fetchGitHubStatistics = () => Promise.reject('');
    const gitHubStateMachine = createGitHubTestStateMachine(fetchGitHubStatistics);
    render(<GitHubStatisticsComponent gitHubStateMachine={gitHubStateMachine} />);

    await waitFor(() => screen.findByText('Failed'));

    t.pass();
});
