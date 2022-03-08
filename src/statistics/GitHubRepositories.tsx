import React, { FunctionComponent } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Cite } from './Cite';
import { Figure } from './Figure';
import { LoadingSpinner } from './LoadingSpinner';
import { StatisticsStateMachineState } from './state-machine';

interface GitHubRepositoriesProps {
    readonly state: StatisticsStateMachineState;
}

export const GitHubRepositories: FunctionComponent<GitHubRepositoriesProps> = (props) => {
    const { state } = props;
    let gitHubRepositories: JSX.Element | number = <LoadingSpinner />;
    if (state.matches('loaded')) {
        gitHubRepositories = state.context.gitHubStatistics.value.user.repositories.totalCount;
    } else if (state.matches('failed')) {
        gitHubRepositories = <FiAlertTriangle />;
    }
    return (
        <Figure description="GitHub Repos">
            <Cite>{gitHubRepositories}</Cite>
        </Figure>
    );
};
