import React, { FunctionComponent } from 'react';
import { Cite } from './Cite';
import { Figure } from './Figure';
import { StatisticsStateMachineState } from './state-machine';

export interface YearsInBusinessProps {
    readonly state: StatisticsStateMachineState;
}

export const YearsInBusiness: FunctionComponent<YearsInBusinessProps> = (props) => {
    const { state } = props;
    return (
        <Figure description="Experience">
            <Cite>{state.context.yearsOfExperience.value} yrs</Cite>
        </Figure>
    );
};
