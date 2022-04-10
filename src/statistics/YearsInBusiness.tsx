import React, { FunctionComponent, ReactElement } from 'react';
import { mapOr } from 'true-myth/maybe';
import { Cite } from './Cite';
import { Figure } from './Figure';
import { StatisticsStateMachineState } from './state-machine';

export interface YearsInBusinessProps {
    readonly state: StatisticsStateMachineState;
}

const renderYearsInBusiness = mapOr<number, ReactElement | null>(null, (yearsOfExperience) => {
    return (
        <Figure description="Experience">
            <Cite aria-label="Years of experience">{yearsOfExperience} yrs</Cite>
        </Figure>
    );
});

export const YearsInBusiness: FunctionComponent<YearsInBusinessProps> = (props) => {
    return renderYearsInBusiness(props.state.context.yearsOfExperience);
};
