import React, { FunctionComponent, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import type KyInterface from 'ky';
import { createGitHubStateMachine } from './state-machine';

interface GitHubStatisticsProps {
    readonly ky: typeof KyInterface;
}

export const GitHubStatistics: FunctionComponent<GitHubStatisticsProps> = (props) => {
    const [state, send] = useMachine(() => {
        return createGitHubStateMachine({ ky: props.ky });
    });
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
