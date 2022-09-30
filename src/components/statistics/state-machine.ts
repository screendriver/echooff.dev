import {
    createMachine,
    assign,
    StateMachine,
    DoneInvokeEvent,
    State,
    ErrorPlatformEvent,
    StateSchema,
    BaseActionObject,
    ServiceMap,
    ResolveTypegenMeta,
    TypegenDisabled,
} from "xstate";
import { Maybe } from "true-myth";
import type { Just, Nothing } from "true-myth/maybe";
import type KyInterface from "ky";
import { GitHubStatistics, gitHubStatisticsSchema } from "./statistics-schema";
import type { ErrorReporter } from "../../error-reporter/reporter";

export type StatisticsMachineEvent = { type: "FETCH" };

export interface StatisticsMachineContext {
    readonly gitHubStatistics: Maybe<GitHubStatistics>;
    readonly yearsOfExperience: Maybe<number>;
}

export type StatisticsTypestate =
    | {
          value: "idle";
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      }
    | {
          value: "loading";
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      }
    | {
          value: "loaded";
          context: StatisticsMachineContext & {
              gitHubStatistics: Just<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      }
    | {
          value: "failed";
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      };

export interface StatisticsMachineDependencies {
    readonly ky: typeof KyInterface;
    readonly errorReporter: ErrorReporter;
    readonly currentTimestamp: Date;
}

export type StatisticsStateMachine = StateMachine<
    StatisticsMachineContext,
    StateSchema<StatisticsMachineContext>,
    StatisticsMachineEvent,
    StatisticsTypestate,
    BaseActionObject,
    ServiceMap,
    ResolveTypegenMeta<TypegenDisabled, StatisticsMachineEvent, BaseActionObject, ServiceMap>
>;

export type StatisticsStateMachineState = State<
    StatisticsMachineContext,
    StatisticsMachineEvent,
    StateSchema<StatisticsMachineContext>,
    StatisticsTypestate,
    ResolveTypegenMeta<TypegenDisabled, StatisticsMachineEvent, BaseActionObject, ServiceMap>
>;

export function createStatisticsStateMachine(dependencies: StatisticsMachineDependencies): StatisticsStateMachine {
    return createMachine<
        StatisticsMachineContext,
        StatisticsMachineEvent,
        StatisticsTypestate,
        ServiceMap,
        TypegenDisabled
    >(
        {
            id: "statistics",
            initial: "idle",
            context: {
                gitHubStatistics: Maybe.nothing(),
                yearsOfExperience: Maybe.nothing(),
            },
            states: {
                idle: {
                    entry: "setYearsOfExperience",
                    on: { FETCH: "loading" },
                },
                loading: {
                    invoke: {
                        id: "fetchGitHubStatistics",
                        src: "fetchGitHubStatistics",
                        onDone: {
                            target: "loaded",
                            actions: "setFetchedGitHubStatistics",
                        },
                        onError: {
                            target: "failed",
                            actions: "reportFetchGitHubStatisticsError",
                        },
                    },
                },
                loaded: {
                    type: "final",
                },
                failed: {
                    on: {
                        FETCH: "loading",
                    },
                },
            },
        },
        {
            actions: {
                setYearsOfExperience: assign({
                    yearsOfExperience(_context) {
                        const currentYear = dependencies.currentTimestamp.getFullYear();
                        const careerStartYear = 2001;

                        return Maybe.just(currentYear - careerStartYear);
                    },
                }),
                setFetchedGitHubStatistics: assign({
                    gitHubStatistics(_context, _event) {
                        const event = _event as DoneInvokeEvent<GitHubStatistics>;

                        return Maybe.just(event.data);
                    },
                }),
                reportFetchGitHubStatisticsError(_context, _event) {
                    const event = _event as ErrorPlatformEvent;

                    dependencies.errorReporter.send(event.data);
                },
            },
            services: {
                async fetchGitHubStatistics() {
                    const gitHubStatistics = await dependencies.ky("/.netlify/functions/github-statistics").json();

                    return gitHubStatisticsSchema.parse(gitHubStatistics);
                },
            },
        }
    ) as StatisticsStateMachine;
}
