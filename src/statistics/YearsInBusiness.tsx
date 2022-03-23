import React, { FunctionComponent } from 'react';
import { Cite } from './Cite';
import { Figure } from './Figure';
import { StatisticsStateMachineState } from './state-machine';

export interface YearsInBusinessProps {
    readonly state: StatisticsStateMachineState;
}

export const YearsInBusiness: FunctionComponent<YearsInBusinessProps> = (props) => {
    return props.state.context.yearsOfExperience.mapOr(null, (yearsOfExperience) => {
        return (
            <Figure description="Experience">
                <Cite aria-label="Years of experience">{yearsOfExperience} yrs</Cite>
            </Figure>
        );
    });
};
