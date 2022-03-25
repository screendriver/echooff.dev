import test from 'ava';
import React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { stub } from 'sinon';
import { just } from 'true-myth/maybe';
import { FiAlertTriangle } from 'react-icons/fi';
import { GitHubStars } from '../../../src/statistics/GitHubStars';
import { StatisticsStateMachineState } from '../../../src/statistics/state-machine';
import { LoadingSpinner } from '../../../src/statistics/LoadingSpinner';

const statisticsStateMachineStateFactory = Factory.define<StatisticsStateMachineState>(() => {
    return {
        context: {
            gitHubStatistics: just({
                user: {
                    starredRepositories: {
                        totalCount: 42,
                    },
                },
            }),
        },
        matches: stub().returns(false),
    } as unknown as StatisticsStateMachineState;
});

function renderGitHubStars(stateOverride?: Partial<StatisticsStateMachineState>): ReactTestRenderer {
    const state = statisticsStateMachineStateFactory.build(stateOverride);
    return create(<GitHubStars state={state} />);
}

test('renders "GitHub Stars" description in a paragraph', (t) => {
    const { root } = renderGitHubStars();
    const divElement = root.findByType('div');
    const paragraphElement = divElement.findByType('p');

    t.deepEqual(paragraphElement.children, ['GitHub Stars']);
});

test('renders a loading spinner while data is being loaded', (t) => {
    const { root } = renderGitHubStars();
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');
    const loadingSpinnerElements = citeElement.findAllByType(LoadingSpinner);

    t.is(loadingSpinnerElements.length, 1);
});

test('renders the total count of starred GitHub repositories after data is being loaded', (t) => {
    const matches = stub().returns(false);
    matches.withArgs('loaded').returns(true);
    const { root } = renderGitHubStars({ matches });
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');

    t.deepEqual(citeElement.children, ['42']);
});

test('renders an alert triangle when data loading failed', (t) => {
    const matches = stub().returns(false);
    matches.withArgs('failed').returns(true);
    const { root } = renderGitHubStars({ matches });
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');
    const loadingSpinnerElements = citeElement.findAllByType(FiAlertTriangle);

    t.is(loadingSpinnerElements.length, 1);
});
