import React, { FunctionComponent, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { FiBarChart2, FiThumbsUp } from 'react-icons/fi';
import { StatisticsStateMachine } from './state-machine';
import { GitHubStatistics as GitHubStatisticsSchema } from './statistics-schema';
import { Figure } from './Figure';

interface StatisticsProps {
    readonly statisticsStateMachine: StatisticsStateMachine;
}

const Cite: FunctionComponent = (props) => {
    return <cite className="text-dracula-green font-bold not-italic mt-2">{props.children}</cite>;
};

function renderStatistics(gitHubStatistics: GitHubStatisticsSchema, yearsOfExperience: number): JSX.Element {
    return (
        <section className="bg-dracula-dark p-2 lg:p-10">
            <h3 className="flex items-start lg:items-end justify-center gap-x-2 text-dracula-cyan text-lg lg:text-4xl font-extrabold my-2">
                Some Stats
                <FiBarChart2 className="text-dracula-light w-6 h-6 lg:w-12 lg:h-12" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 sm:p-4">
                <Figure description="Years of Experience">
                    <Cite>{yearsOfExperience}</Cite>
                </Figure>
                <Figure description="GitHub Repos">
                    <Cite>{gitHubStatistics.user.repositories.totalCount}</Cite>
                </Figure>
                <Figure description="GitHub Stars">
                    <Cite>{gitHubStatistics.user.starredRepositories.totalCount}</Cite>
                </Figure>
                <Figure description="Lines of Code">
                    <FiThumbsUp className="text-dracula-green w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mt-2" />
                </Figure>
            </div>
        </section>
    );
}

export const Statistics: FunctionComponent<StatisticsProps> = (props) => {
    const { statisticsStateMachine } = props;
    const [state, send] = useMachine(statisticsStateMachine);
    useEffect(() => {
        send('FETCH');
    }, []);
    if (state.matches('idle') || state.matches('loading')) {
        return <h1>Loading</h1>;
    }
    if (state.matches('loaded')) {
        const { context } = state;
        return renderStatistics(context.gitHubStatistics.value, context.yearsOfExperience.value);
    }
    if (state.matches('failed')) {
        return <h1>Failed</h1>;
    }
    return null;
};
