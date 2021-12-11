import test from 'ava';
import React from 'react';
import { create } from 'react-test-renderer';
import { Cite } from '../../../src/statistics/Cite';

test('renders given children into an <cite /> element', (t) => {
    const { root } = create(
        <Cite>
            <h1>Test</h1>
        </Cite>,
    );
    const citeElement = root.findByType('cite');
    const h1Element = citeElement.findByType('h1');

    t.deepEqual(h1Element.children, ['Test']);
});
