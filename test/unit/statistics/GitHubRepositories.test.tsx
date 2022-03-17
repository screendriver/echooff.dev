import test from 'ava';
import React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { stub } from 'sinon';
import { Maybe } from 'true-myth';
import { FiAlertTriangle } from 'react-icons/fi';
import { GitHubRepositories } from '../../../src/statistics/GitHubRepositories';
import { StatisticsStateMachineState } from '../../../src/statistics/state-machine';
import { LoadingSpinner } from '../../../src/statistics/LoadingSpinner';

const statisticsStateMachineStateFactory = Factory.define<StatisticsStateMachineState>(() => {
    return {
        context: {
            gitHubStatistics: Maybe.just({
                user: {
                    repositories: {
                        totalCount: 42,
                    },
                },
            }),
        },
        matches: stub().returns(false),
    } as unknown as StatisticsStateMachineState;
});

function renderGitHubRepositories(stateOverride?: Partial<StatisticsStateMachineState>): ReactTestRenderer {
    const state = statisticsStateMachineStateFactory.build(stateOverride);
    return create(<GitHubRepositories state={state} />);
}

test('renders "GitHub Repos" description in a paragraph', (t) => {
    const { root } = renderGitHubRepositories();
    const divElement = root.findByType('div');
    const paragraphElement = divElement.findByType('p');

    t.deepEqual(paragraphElement.children, ['GitHub Repos']);
});

test('renders a loading spinner while data is being loaded', (t) => {
    const { root } = renderGitHubRepositories();
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');
    const loadingSpinnerElements = citeElement.findAllByType(LoadingSpinner);

    t.is(loadingSpinnerElements.length, 1);
});

test('renders the total count of GitHub repositories after data is being loaded', (t) => {
    const matches = stub().returns(false);
    matches.withArgs('loaded').returns(true);
    const { root } = renderGitHubRepositories({ matches });
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');

    t.deepEqual(citeElement.children, ['42']);
});

test('renders an alert triangle when data loading failed', (t) => {
    const matches = stub().returns(false);
    matches.withArgs('failed').returns(true);
    const { root } = renderGitHubRepositories({ matches });
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');
    const loadingSpinnerElements = citeElement.findAllByType(FiAlertTriangle);

    t.is(loadingSpinnerElements.length, 1);
});
