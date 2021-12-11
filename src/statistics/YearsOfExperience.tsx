import React, { FunctionComponent } from 'react';
import { Cite } from './Cite';
import { Figure } from './Figure';
import { StatisticsStateMachineState } from './state-machine';

export interface YearsOfExperienceProps {
    readonly state: StatisticsStateMachineState;
}

export const YearsOfExperience: FunctionComponent<YearsOfExperienceProps> = (props) => {
    const { state } = props;
    return (
        <Figure description="Years of Experience">
            <Cite>{state.context.yearsOfExperience.value}</Cite>
        </Figure>
    );
};
