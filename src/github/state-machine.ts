import { createMachine, assign, StateMachine, DoneInvokeEvent } from 'xstate';
import Maybe, { Just, just, Nothing, nothing } from 'true-myth/maybe';
import type KyInterface from 'ky';
import { GitHubStatistics, gitHubStatisticsSchema } from './statistics-schema';

export type GitHubMachineEvent = { type: 'FETCH' };

export interface GitHubMachineContext {
    readonly gitHubStatistics: Maybe<GitHubStatistics>;
}

export type GitHubTypestate =
    | {
          value: 'idle';
          context: GitHubMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
          };
      }
    | {
          value: 'loading';
          context: GitHubMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
          };
      }
    | {
          value: 'loaded';
          context: GitHubMachineContext & {
              gitHubStatistics: Just<GitHubStatistics>;
          };
      }
    | {
          value: 'failed';
          context: GitHubMachineContext & {
              gitHubStatistics: Nothing<GitHubStatistics>;
          };
      };

export interface GitHubMachineDependencies {
    readonly ky: typeof KyInterface;
}

export type GitHubStateMachine = StateMachine<GitHubMachineContext, any, GitHubMachineEvent, GitHubTypestate>;

export function createGitHubStateMachine(dependencies: GitHubMachineDependencies): GitHubStateMachine {
    return createMachine<GitHubMachineContext, GitHubMachineEvent, GitHubTypestate>(
        {
            id: 'gitHub',
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
