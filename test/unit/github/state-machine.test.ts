import test from 'ava';
import { fake } from 'sinon';
import { Factory } from 'fishery';
import { interpret, Interpreter } from 'xstate';
import type KyInterface from 'ky';
import { just, nothing } from 'true-myth/maybe';
import { setImmediate } from 'timers/promises';
import {
    createGitHubStateMachine,
    GitHubMachineContext,
    GitHubMachineDependencies,
    GitHubMachineEvent,
    GitHubTypestate,
} from '../../../src/github/state-machine';
import { GitHubStatistics } from '../../../src/github/statistics-schema';

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

function createGitHubMachineDependencies(overrides: Partial<GitHubMachineDependencies>): GitHubMachineDependencies {
    const gitHubStatistics = gitHubStatisticsFactory.build();
    return {
        ky: fake.returns({
            json: fake.resolves(gitHubStatistics),
        }),
        ...overrides,
    } as unknown as GitHubMachineDependencies;
}

function createGitHubStateService(
    overrides: Partial<GitHubMachineDependencies> = {},
): Interpreter<GitHubMachineContext, any, GitHubMachineEvent, GitHubTypestate> {
    const dependencies = createGitHubMachineDependencies(overrides);
    const gitHubStateMachine = createGitHubStateMachine(dependencies);
    return interpret(gitHubStateMachine).start();
}

test('initial state', (t) => {
    const gitHubStateService = createGitHubStateService();

    t.is(gitHubStateService.initialState.value, 'idle');
});

test('transits from "idle" to "loading" on "FETCH" event', (t) => {
    const gitHubStateService = createGitHubStateService();

    gitHubStateService.send('FETCH');

    t.true(gitHubStateService.state.matches('loading'));
});

test('makes a HTTP GET request to "/api/github/statistics" on "FETCH" event', (t) => {
    const gitHubStatistics = gitHubStatisticsFactory.build();
    const ky = fake.returns({
        json: fake.resolves(gitHubStatistics),
    });
    const gitHubStateService = createGitHubStateService({ ky: ky as unknown as typeof KyInterface });

    gitHubStateService.send('FETCH');

    t.true(ky.calledOnceWith('/api/github/statistics'));
});

test('sets "context.gitHubStatistics" after loading GitHub statistics', async (t) => {
    const gitHubStateService = createGitHubStateService();

    gitHubStateService.send('FETCH');
    await setImmediate();

    t.deepEqual(gitHubStateService.state.context, {
        gitHubStatistics: just({
            user: {
                repositories: {
                    totalCount: 7,
                },
                starredRepositories: {
                    totalCount: 42,
                },
            },
        }),
    });
});

test('transits from "loading" to "loaded" after "FETCH" event is done', async (t) => {
    const gitHubStateService = createGitHubStateService();

    gitHubStateService.send('FETCH');
    await setImmediate();

    t.true(gitHubStateService.state.matches('loaded'));
});

test('sets "loaded" state type to "final" ', async (t) => {
    const gitHubStateService = createGitHubStateService();

    gitHubStateService.send('FETCH');
    await setImmediate();

    t.true(gitHubStateService.state.done);
});

test('transit from "loading" to "failed" when fetching of GitHub statistics failed', async (t) => {
    const ky = fake.returns({
        json: fake.rejects(undefined),
    });
    const gitHubStateService = createGitHubStateService({ ky: ky as unknown as typeof KyInterface });

    gitHubStateService.send('FETCH');
    await setImmediate();

    t.true(gitHubStateService.state.matches('failed'));
});

test('transit from "loading" to "failed" when fetching of GitHub statistics returned invalid data', async (t) => {
    const gitHubStatistics = gitHubStatisticsFactory.build({
        user: {
            repositories: {
                totalCount: 'foo',
            },
        },
    } as unknown as GitHubStatistics);
    const ky = fake.returns({
        json: fake.resolves(gitHubStatistics),
    });
    const gitHubStateService = createGitHubStateService({ ky: ky as unknown as typeof KyInterface });

    gitHubStateService.send('FETCH');
    await setImmediate();

    t.true(gitHubStateService.state.matches('failed'));
    t.deepEqual(gitHubStateService.state.context.gitHubStatistics, nothing());
});
