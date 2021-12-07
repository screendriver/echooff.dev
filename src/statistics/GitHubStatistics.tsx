import React, { FunctionComponent, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { FiBarChart2 } from 'react-icons/fi';
import { GitHubStateMachine } from './state-machine';
import { GitHubStatistics as GitHubStatisticsSchema } from './statistics-schema';
import { Figure } from './Figure';

interface GitHubStatisticsProps {
    readonly gitHubStateMachine: GitHubStateMachine;
}

function renderGitHubStatistics(gitHubStatistics: GitHubStatisticsSchema): JSX.Element {
    return (
        <section className="bg-dracula-dark p-2 lg:p-10">
            <h3 className="flex items-start lg:items-end justify-center gap-x-2 text-dracula-cyan text-lg lg:text-4xl font-extrabold my-2">
                Some Stats
                <FiBarChart2 className="text-dracula-light w-6 h-6 lg:w-12 lg:h-12" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 sm:p-4">
                <Figure description="GitHub Repos" count={gitHubStatistics.user.repositories.totalCount} />
                <Figure description="GitHub Stars" count={gitHubStatistics.user.starredRepositories.totalCount} />
                <Figure description="Years of Experience" count={42} />
                <Figure description="Lines of Code" count={42} />
            </div>
        </section>
    );
}

export const GitHubStatistics: FunctionComponent<GitHubStatisticsProps> = (props) => {
    const { gitHubStateMachine } = props;
    const [state, send] = useMachine(gitHubStateMachine);
    useEffect(() => {
        send('FETCH');
    }, []);
    if (state.matches('idle') || state.matches('loading')) {
        return <h1>Loading</h1>;
    }
    if (state.matches('loaded')) {
        return renderGitHubStatistics(state.context.gitHubStatistics.value);
    }
    if (state.matches('failed')) {
        return <h1>Failed</h1>;
    }
    return null;
};
