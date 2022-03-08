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
import { FiBarChart, FiBarChart2 } from 'react-icons/fi';
import { YearsInBusiness } from '../../../src/statistics/YearsInBusiness';
import { GitHubRepositories } from '../../../src/statistics/GitHubRepositories';
import { GitHubStars } from '../../../src/statistics/GitHubStars';

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

test('renders a heading with "Some stats" after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const headingElement = sectionElement.findByType('h3');

    t.is(headingElement.children.at(0), 'Some Stats');
});

test('renders a chart icon in a heading after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const iconElements = sectionElement.findAllByType(FiBarChart2);

    t.is(iconElements.length, 1);
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
    const yearsOfExperienceElements = divElements.at(0)?.findAllByType(YearsInBusiness);

    t.is(yearsOfExperienceElements?.length, 1);
});

test('renders GitHub repositories GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const gitHubRepositoriesElements = divElements.at(0)?.findAllByType(GitHubRepositories);

    t.is(gitHubRepositoriesElements?.length, 1);
});

test('renders GitHub stars after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const gitHubStarsElements = divElements.at(0)?.findAllByType(GitHubStars);

    t.is(gitHubStarsElements?.length, 1);
});

test('renders lines of code icon after GitHub statistics were fetched', async (t) => {
    const { root } = renderStatistics();
    await setImmediate();
    const sectionElement = root.findByType('section');
    const divElements = sectionElement.findAllByType('div');
    const iconElements = divElements.at(4)?.findAllByType(FiBarChart);

    t.is(iconElements?.length, 1);
});

test('sends "FETCH" to the state machine after it was rendered', (t) => {
    const fetchGitHubStatistics = fake.rejects('');
    const statisticsStateMachine = createStatisticsTestStateMachine(fetchGitHubStatistics);
    renderStatistics(statisticsStateMachine);

    t.is(fetchGitHubStatistics.callCount, 1);
});
