import test from 'ava';
import React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { just } from 'true-myth/maybe';
import { YearsOfExperience } from '../../../src/statistics/YearsOfExperience';
import { StatisticsStateMachineState } from '../../../src/statistics/state-machine';

const statisticsStateMachineStateFactory = Factory.define<StatisticsStateMachineState>(() => {
    return {
        context: {
            yearsOfExperience: just(42),
        },
    } as StatisticsStateMachineState;
});

function renderYearsOfExperience(): ReactTestRenderer {
    const state = statisticsStateMachineStateFactory.build();
    return create(<YearsOfExperience state={state} />);
}

test('renders "Years of Experience" description in a paragraph', (t) => {
    const { root } = renderYearsOfExperience();
    const divElement = root.findByType('div');
    const paragraphElement = divElement.findByType('p');

    t.deepEqual(paragraphElement.children, ['Years of Experience']);
});

test('renders the years of experience into a <cite /> element', (t) => {
    const { root } = renderYearsOfExperience();
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');

    t.deepEqual(citeElement.children, ['42']);
});
