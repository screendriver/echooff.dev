import test from 'ava';
import React from 'react';
import { fake } from 'sinon';
import { Factory } from 'fishery';
import { setImmediate } from 'timers/promises';
import type KyInterface from 'ky';
import { create, ReactTestRenderer } from 'react-test-renderer';
import {
    createStatisticsStateMachine,
    StatisticsMachineDependencies,
    StatisticsStateMachine,
} from '../../../src/statistics/state-machine';
import { Statistics } from '../../../src/statistics/Statistics';
import { GitHubStatistics } from '../../../src/statistics/statistics-schema';

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
    const dependencies: StatisticsMachineDependencies = { ky, currentTimestamp: new Date(2021, 11, 8) };
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

function renderStatistics(statisticsStateMachineOverride?: StatisticsStateMachine): ReactTestRenderer {
    const statisticsStateMachine = statisticsStateMachineOverride ?? createStatisticsTestStateMachine();
    return create(<Statistics statisticsStateMachine={statisticsStateMachine} />);
}

test('shows "Loading" while fetching GitHub statistics', (t) => {
    const { root } = renderStatistics();
    const headingElement = root.findByType('h1');

    t.deepEqual(headingElement.children, ['Loading']);
});

test('renders a heading with "Some stats" after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const headingElement = sectionElement.findByType('h3');

    t.is(headingElement.children.at(0), 'Some Stats');
});

test('renders a horizontal line after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const horizontalLineElements = sectionElement.findAllByType('hr');

    t.is(horizontalLineElements.length, 1);
});

test('renders years of experience after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const paragraphElement = divElements.at(1)?.findByType('p');
    const citeElement = divElements.at(1)?.findByType('cite');

    t.deepEqual(paragraphElement?.children, ['Years of Experience']);
    t.deepEqual(citeElement?.children, ['20']);
});

test('renders the total count of repositories after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const paragraphElement = divElements.at(2)?.findByType('p');
    const citeElement = divElements.at(2)?.findByType('cite');

    t.deepEqual(paragraphElement?.children, ['GitHub Repos']);
    t.deepEqual(citeElement?.children, ['7']);
});

test('renders the total count of starred repositories after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const paragraphElement = divElements.at(3)?.findByType('p');
    const citeElement = divElements.at(3)?.findByType('cite');

    t.deepEqual(paragraphElement?.children, ['GitHub Stars']);
    t.deepEqual(citeElement?.children, ['42']);
});

test('renders lines of code after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const paragraphElement = divElements.at(4)?.findByType('p');

    t.deepEqual(paragraphElement?.children, ['Lines of Code']);
});

test('shows "Failed" when fetching GitHub statistics failed', async (t) => {
    const fetchGitHubStatistics = () => Promise.reject('');
    const statisticsStateMachine = createStatisticsTestStateMachine(fetchGitHubStatistics);
    const { root } = renderStatistics(statisticsStateMachine);
    await setImmediate();

    const headingElement = root.findByType('h1');

    t.deepEqual(headingElement.children, ['Failed']);
});
