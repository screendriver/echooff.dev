import React, { FunctionComponent, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { GitHubStateMachine } from './state-machine';

interface GitHubStatisticsProps {
    readonly gitHubStateMachine: GitHubStateMachine;
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
        return <h1>Loaded</h1>;
    }
    if (state.matches('failed')) {
        return <h1>Failed</h1>;
    }
    return null;
};
