import { createMachine, assign, StateMachine, DoneInvokeEvent } from 'xstate';
import Maybe, { Just, just, Nothing, nothing } from 'true-myth/maybe';
import type KyInterface from 'ky';
import { GitHubStatistics, gitHubStatisticsSchema } from './statistics-schema';

export type StatisticsMachineEvent = { type: 'FETCH' };

export interface StatisticsMachineContext {
    readonly gitHubStatistics: Maybe<GitHubStatistics>;
    readonly yearsOfExperience: Maybe<number>;
}

export type StatisticsTypestate =
    | {
          value: 'idle';
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      }
    | {
          value: 'loading';
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      }
    | {
          value: 'loaded';
          context: StatisticsMachineContext & {
              gitHubStatistics: Just<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      }
    | {
          value: 'failed';
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
              yearsOfExperience: Just<number>;
          };
      };

export interface StatisticsMachineDependencies {
    readonly ky: typeof KyInterface;
    readonly currentTimestamp: Date;
}

export type StatisticsStateMachine = StateMachine<
    StatisticsMachineContext,
    any,
    StatisticsMachineEvent,
    StatisticsTypestate
>;

export function createStatisticsStateMachine(dependencies: StatisticsMachineDependencies): StatisticsStateMachine {
    return createMachine<StatisticsMachineContext, StatisticsMachineEvent, StatisticsTypestate>(
        {
            id: 'statistics',
            initial: 'idle',
            context: {
                gitHubStatistics: nothing(),
                yearsOfExperience: nothing(),
            },
            states: {
                idle: {
                    entry: 'setYearsOfExperience',
                    on: { FETCH: 'loading' },
                },
                loading: {
                    invoke: {
                        id: 'fetchGitHubStatistics',
                        src: 'fetchGitHubStatistics',
                        onDone: {
                            target: 'loaded',
                            actions: 'setFetchedGitHubStatistics',
                        },
                        onError: 'failed',
                    },
                },
                loaded: {
                    type: 'final',
                },
                failed: {
                    on: {
                        FETCH: 'loading',
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
                        return just(currentYear - careerStartYear);
                    },
                }),
                setFetchedGitHubStatistics: assign({
                    gitHubStatistics(_context, _event) {
                        const event = _event as DoneInvokeEvent<GitHubStatistics>;
                        return just(event.data);
                    },
                }),
            },
            services: {
                async fetchGitHubStatistics() {
                    const gitHubStatistics = await dependencies.ky('/api/github/statistics').json();
                    return gitHubStatisticsSchema.parse(gitHubStatistics);
                },
            },
        },
    );
}
