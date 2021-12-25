import React, { FunctionComponent, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { FiBarChart, FiBarChart2 } from 'react-icons/fi';
import { StatisticsStateMachine, StatisticsStateMachineState } from './state-machine';
import { Figure } from './Figure';
import { GitHubStars } from './GitHubStars';
import { GitHubRepositories } from './GitHubRepositories';
import { YearsInBusiness } from './YearsInBusiness';

interface StatisticsProps {
    readonly statisticsStateMachine: StatisticsStateMachine;
}

function renderStatistics(state: StatisticsStateMachineState): JSX.Element {
    return (
        <section className="bg-dracula-dark p-4 lg:p-10">
            <h3 className="flex items-start lg:items-end justify-center gap-x-2 text-dracula-cyan text-2xl lg:text-4xl font-extrabold my-2">
                Some Stats
                <FiBarChart2 className="text-dracula-light w-6 h-6 lg:w-12 lg:h-12" />
            </h3>
            <hr className="h-2 w-1/2 border-none mb-4 m-auto bg-dracula-red bg-gradient-to-br from-yellow to-dracula-pink rounded-lg" />
            <div className="m-auto max-w-screen-lg grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 sm:p-4">
                <YearsInBusiness state={state} />
                <GitHubRepositories state={state} />
                <GitHubStars state={state} />
                <Figure description="Lines of Code">
                    <FiBarChart className="text-dracula-green w-6 h-6 mt-2" />
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

    return renderStatistics(state);
};
