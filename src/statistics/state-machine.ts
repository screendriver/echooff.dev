import { createMachine, assign, StateMachine, DoneInvokeEvent } from 'xstate';
import Maybe, { Just, just, Nothing, nothing } from 'true-myth/maybe';
import type KyInterface from 'ky';
import { GitHubStatistics, gitHubStatisticsSchema } from './statistics-schema';

export type StatisticsMachineEvent = { type: 'FETCH' };

export interface StatisticsMachineContext {
    readonly gitHubStatistics: Maybe<GitHubStatistics>;
}

export type StatisticsTypestate =
    | {
          value: 'idle';
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
          };
      }
    | {
          value: 'loading';
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
          };
      }
    | {
          value: 'loaded';
          context: StatisticsMachineContext & {
              gitHubStatistics: Just<GitHubStatistics>;
          };
      }
    | {
          value: 'failed';
          context: StatisticsMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
          };
      };

export interface StatisticsMachineDependencies {
    readonly ky: typeof KyInterface;
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
            },
            states: {
                idle: {
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
                setFetchedGitHubStatistics: assign({
                    gitHubStatistics: (_, _event) => {
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
