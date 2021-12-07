import React, { FunctionComponent } from 'react';
import { GitHubStatistics } from './GitHubStatistics';
import { GitHubStateMachine } from './state-machine';

interface StatisticsProps {
    readonly gitHubStateMachine: GitHubStateMachine;
}

export const Statistics: FunctionComponent<StatisticsProps> = (props) => {
    return <GitHubStatistics gitHubStateMachine={props.gitHubStateMachine} />;
};
