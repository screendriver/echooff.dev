import test from 'ava';
import React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { just } from 'true-myth/maybe';
import { YearsInBusiness } from '../../../src/statistics/YearsInBusiness';
import { StatisticsStateMachineState } from '../../../src/statistics/state-machine';

const statisticsStateMachineStateFactory = Factory.define<StatisticsStateMachineState>(() => {
    return {
        context: {
            yearsOfExperience: just(42),
        },
    } as StatisticsStateMachineState;
});

function renderYearsInBusiness(): ReactTestRenderer {
    const state = statisticsStateMachineStateFactory.build();
    return create(<YearsInBusiness state={state} />);
}

test('renders "Experience" description in a paragraph', (t) => {
    const { root } = renderYearsInBusiness();
    const divElement = root.findByType('div');
    const paragraphElement = divElement.findByType('p');

    t.deepEqual(paragraphElement.children, ['Experience']);
});

test('renders the years of experience into a <cite /> element', (t) => {
    const { root } = renderYearsInBusiness();
    const divElement = root.findByType('div');
    const citeElement = divElement.findByType('cite');

    t.deepEqual(citeElement.children, ['42', ' yrs']);
});
