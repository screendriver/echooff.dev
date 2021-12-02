import React from 'react';
import test from 'ava';
import { fake } from 'sinon';
import { cleanup, render, waitFor } from '@testing-library/react';
import { Factory } from 'fishery';
import type KyInterface from 'ky';
import { GitHubStatistics } from '../../../src/github/statistics-schema';
import { GitHubStatistics as GitHubStatisticsComponent } from '../../../src/github/GitHubStatistics';

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

test.afterEach(cleanup);

test('shows "Loading" while fetching GitHub statistics', (t) => {
    const gitHubStatistics = gitHubStatisticsFactory.build();
    const ky = fake.returns({
        json: fake.resolves(gitHubStatistics),
    }) as unknown as typeof KyInterface;
    const { queryByText } = render(<GitHubStatisticsComponent ky={ky} />);

    t.not(queryByText('Loading'), null);
});

test('shows "Loaded" after GitHub statistics were fetched', async (t) => {
    const gitHubStatistics = gitHubStatisticsFactory.build();
    const ky = fake.returns({
        json: fake.resolves(gitHubStatistics),
    }) as unknown as typeof KyInterface;
    const { findByText } = render(<GitHubStatisticsComponent ky={ky} />);

    await waitFor(() => findByText('Loaded'));

    t.pass();
});

test('shows "Failed" when fetching GitHub statistics failed', async (t) => {
    const ky = fake.returns({
        json: fake.rejects(undefined),
    }) as unknown as typeof KyInterface;
    const { findByText } = render(<GitHubStatisticsComponent ky={ky} />);

    await waitFor(() => findByText('Failed'));

    t.pass();
});
