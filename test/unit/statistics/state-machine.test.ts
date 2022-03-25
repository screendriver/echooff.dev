import test from 'ava';
import { fake } from 'sinon';
import { Factory } from 'fishery';
import {
    BaseActionObject,
    interpret,
    Interpreter,
    ResolveTypegenMeta,
    ServiceMap,
    StateSchema,
    TypegenDisabled,
} from 'xstate';
import type KyInterface from 'ky';
import { just, nothing } from 'true-myth/maybe';
import { setImmediate } from 'timers/promises';
import {
    createStatisticsStateMachine,
    StatisticsMachineContext,
    StatisticsMachineDependencies,
    StatisticsMachineEvent,
    StatisticsTypestate,
} from '../../../src/statistics/state-machine';
import { GitHubStatistics } from '../../../src/statistics/statistics-schema';
import { ErrorReporter } from '../../../src/error-reporter/reporter';

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

const errorReporterFactory = Factory.define<ErrorReporter>(() => {
    return {
        send: fake(),
    };
});

function createStatisticsMachineDependencies(
    overrides: Partial<StatisticsMachineDependencies>,
): StatisticsMachineDependencies {
    const gitHubStatistics = gitHubStatisticsFactory.build();
    return {
        ky: fake.returns({
            json: fake.resolves(gitHubStatistics),
        }),
        errorReporter: errorReporterFactory.build(),
        currentTimestamp: new Date(2021, 3, 10),
        ...overrides,
    } as unknown as StatisticsMachineDependencies;
}

function createStatisticsStateService(
    overrides: Partial<StatisticsMachineDependencies> = {},
): Interpreter<
    StatisticsMachineContext,
    StateSchema<StatisticsMachineContext>,
    StatisticsMachineEvent,
    StatisticsTypestate,
    ResolveTypegenMeta<TypegenDisabled, StatisticsMachineEvent, BaseActionObject, ServiceMap>
> {
    const dependencies = createStatisticsMachineDependencies(overrides);
    const statisticsStateMachine = createStatisticsStateMachine(dependencies);
    return interpret(statisticsStateMachine).start();
}

test('initial state', (t) => {
    const statisticsStateService = createStatisticsStateService();

    t.is(statisticsStateService.initialState.value, 'idle');
});

test('initial context', (t) => {
    const statisticsStateService = createStatisticsStateService();

    t.deepEqual(statisticsStateService.initialState.context, {
        gitHubStatistics: nothing<GitHubStatistics>(),
        yearsOfExperience: just(20),
    });
});

test('transits from "idle" to "loading" on "FETCH" event', (t) => {
    const statisticsStateService = createStatisticsStateService();

    statisticsStateService.send('FETCH');

    t.true(statisticsStateService.state.matches('loading'));
});

test('makes a HTTP GET request to "/api/github/statistics" on "FETCH" event', (t) => {
    const gitHubStatistics = gitHubStatisticsFactory.build();
    const ky = fake.returns({
        json: fake.resolves(gitHubStatistics),
    });
    const statisticsStateService = createStatisticsStateService({ ky: ky as unknown as typeof KyInterface });

    statisticsStateService.send('FETCH');

    t.true(ky.calledOnceWith('/api/github/statistics'));
});

test('sets "context.gitHubStatistics" after loading GitHub statistics', async (t) => {
    const statisticsStateService = createStatisticsStateService();

    statisticsStateService.send('FETCH');
    await setImmediate();

    t.deepEqual(statisticsStateService.state.context, {
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
        yearsOfExperience: just(20),
    });
});

test('transits from "loading" to "loaded" after "FETCH" event is done', async (t) => {
    const statisticsStateService = createStatisticsStateService();

    statisticsStateService.send('FETCH');
    await setImmediate();

    t.true(statisticsStateService.state.matches('loaded'));
});

test('sets "loaded" state type to "final" ', async (t) => {
    const statisticsStateService = createStatisticsStateService();

    statisticsStateService.send('FETCH');
    await setImmediate();

    t.true(statisticsStateService.state.done);
});

test('transit from "loading" to "failed" when fetching of GitHub statistics failed', async (t) => {
    const ky = fake.returns({
        json: fake.rejects(undefined),
    });
    const statisticsStateService = createStatisticsStateService({ ky: ky as unknown as typeof KyInterface });

    statisticsStateService.send('FETCH');
    await setImmediate();

    t.true(statisticsStateService.state.matches('failed'));
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
    const statisticsStateService = createStatisticsStateService({ ky: ky as unknown as typeof KyInterface });

    statisticsStateService.send('FETCH');
    await setImmediate();

    t.true(statisticsStateService.state.matches('failed'));
    t.deepEqual(statisticsStateService.state.context.gitHubStatistics, nothing<GitHubStatistics>());
});

test('reports the occurred error when fetching of GitHub statistics failed', async (t) => {
    const error = new Error('Failed test');
    const ky = fake.returns({
        json: fake.rejects(error),
    });
    const send = fake();
    const errorReporter = errorReporterFactory.build({ send });
    const statisticsStateService = createStatisticsStateService({
        ky: ky as unknown as typeof KyInterface,
        errorReporter,
    });

    statisticsStateService.send('FETCH');
    await setImmediate();

    t.true(send.calledOnceWith(error));
});
