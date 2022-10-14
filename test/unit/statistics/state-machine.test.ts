import { test, assert, vi } from "vitest";
import { Factory } from "fishery";
import {
	BaseActionObject,
	interpret,
	Interpreter,
	ResolveTypegenMeta,
	ServiceMap,
	StateSchema,
	TypegenDisabled
} from "xstate";
import type KyInterface from "ky";
import { Maybe } from "true-myth";
import { setImmediate } from "timers/promises";
import {
	createStatisticsStateMachine,
	StatisticsMachineContext,
	StatisticsMachineDependencies,
	StatisticsMachineEvent,
	StatisticsTypestate
} from "../../../src/statistics/state-machine";
import type { GitHubStatistics } from "../../../src/statistics/statistics-schema";
import type { ErrorReporter } from "../../../src/error-reporter/reporter";

const gitHubStatisticsFactory = Factory.define<GitHubStatistics>(() => {
	return {
		user: {
			repositories: {
				totalCount: 7
			},
			starredRepositories: {
				totalCount: 42
			}
		}
	};
});

const errorReporterFactory = Factory.define<ErrorReporter>(() => {
	return {
		send: vi.fn()
	};
});

function createStatisticsMachineDependencies(
	overrides: Partial<StatisticsMachineDependencies>
): StatisticsMachineDependencies {
	const gitHubStatistics = gitHubStatisticsFactory.build();
	return {
		ky: vi.fn().mockReturnValue({
			json: vi.fn().mockResolvedValue(gitHubStatistics)
		}),
		errorReporter: errorReporterFactory.build(),
		currentTimestamp: new Date(2021, 3, 10),
		...overrides
	} as unknown as StatisticsMachineDependencies;
}

function createStatisticsStateService(
	overrides: Partial<StatisticsMachineDependencies> = {}
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

test("initial state", () => {
	const statisticsStateService = createStatisticsStateService();

	assert.strictEqual(statisticsStateService.initialState.value, "idle");
});

test("initial context", () => {
	const statisticsStateService = createStatisticsStateService();

	assert.deepEqual(statisticsStateService.initialState.context, {
		gitHubStatistics: Maybe.nothing<GitHubStatistics>(),
		yearsOfExperience: Maybe.just(20)
	});
});

test('transits from "idle" to "loading" on "FETCH" event', () => {
	const statisticsStateService = createStatisticsStateService();

	statisticsStateService.send("FETCH");

	assert.isTrue(statisticsStateService.state.matches("loading"));
});

test('makes a HTTP GET request to "/api/github-statistics" on "FETCH" event', () => {
	const gitHubStatistics = gitHubStatisticsFactory.build();
	const ky = vi.fn().mockReturnValue({
		json: vi.fn().mockResolvedValue(gitHubStatistics)
	});
	const statisticsStateService = createStatisticsStateService({ ky: ky as unknown as typeof KyInterface });

	statisticsStateService.send("FETCH");

	assert.strictEqual(ky.mock.calls.length, 1);
	assert.strictEqual(ky.mock.calls[0]?.[0], "/api/github-statistics");
});

test('sets "context.gitHubStatistics" after loading GitHub statistics', async () => {
	const statisticsStateService = createStatisticsStateService();

	statisticsStateService.send("FETCH");
	await setImmediate();

	assert.deepEqual(statisticsStateService.state.context, {
		gitHubStatistics: Maybe.just({
			user: {
				repositories: {
					totalCount: 7
				},
				starredRepositories: {
					totalCount: 42
				}
			}
		}),
		yearsOfExperience: Maybe.just(20)
	});
});

test('transits from "loading" to "loaded" after "FETCH" event is done', async () => {
	const statisticsStateService = createStatisticsStateService();

	statisticsStateService.send("FETCH");
	await setImmediate();

	assert.isTrue(statisticsStateService.state.matches("loaded"));
});

test('sets "loaded" state type to "final" ', async () => {
	const statisticsStateService = createStatisticsStateService();

	statisticsStateService.send("FETCH");
	await setImmediate();

	assert.isTrue(statisticsStateService.state.done);
});

test('transit from "loading" to "failed" when fetching of GitHub statistics failed', async () => {
	const ky = vi.fn().mockReturnValue({
		json: vi.fn().mockRejectedValue(undefined)
	});
	const statisticsStateService = createStatisticsStateService({ ky: ky as unknown as typeof KyInterface });

	statisticsStateService.send("FETCH");
	await setImmediate();

	assert.isTrue(statisticsStateService.state.matches("failed"));
});

test('transit from "loading" to "failed" when fetching of GitHub statistics returned invalid data', async () => {
	const gitHubStatistics = gitHubStatisticsFactory.build({
		user: {
			repositories: {
				totalCount: "foo"
			}
		}
	} as unknown as GitHubStatistics);
	const ky = vi.fn().mockReturnValue({
		json: vi.fn().mockResolvedValue(gitHubStatistics)
	});
	const statisticsStateService = createStatisticsStateService({ ky: ky as unknown as typeof KyInterface });

	statisticsStateService.send("FETCH");
	await setImmediate();

	assert.isTrue(statisticsStateService.state.matches("failed"));
	assert.deepEqual(statisticsStateService.state.context.gitHubStatistics, Maybe.nothing<GitHubStatistics>());
});

test("reports the occurred error when fetching of GitHub statistics failed", async () => {
	const error = new Error("Failed test");
	const ky = vi.fn().mockReturnValue({
		json: vi.fn().mockRejectedValue(error)
	});
	const send = vi.fn();
	const errorReporter = errorReporterFactory.build({ send });
	const statisticsStateService = createStatisticsStateService({
		ky: ky as unknown as typeof KyInterface,
		errorReporter
	});

	statisticsStateService.send("FETCH");
	await setImmediate();

	assert.strictEqual(send.mock.calls.length, 1);
	assert.deepStrictEqual(send.mock.calls[0]?.[0], error);
});
