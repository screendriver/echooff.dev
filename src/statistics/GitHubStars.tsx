import React, { FunctionComponent } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Cite } from './Cite';
import { Figure } from './Figure';
import { LoadingSpinner } from './LoadingSpinner';
import { StatisticsStateMachineState } from './state-machine';

interface GitHubStarsProps {
    readonly state: StatisticsStateMachineState;
}

export const GitHubStars: FunctionComponent<GitHubStarsProps> = (props) => {
    const { state } = props;
    let gitHubStars: JSX.Element | number = <LoadingSpinner />;
    if (state.matches('loaded')) {
        gitHubStars = state.context.gitHubStatistics.value.user.starredRepositories.totalCount;
    } else if (state.matches('failed')) {
        gitHubStars = <FiAlertTriangle />;
    }

    return (
        <Figure description="GitHub Stars">
            <Cite aria-label="GitHub Stars">{gitHubStars}</Cite>
        </Figure>
    );
};
