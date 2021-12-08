import test from 'ava';
import React from 'react';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Figure } from '../../../src/statistics/Figure';

function renderFigure(children?: React.ReactNode): ReactTestRenderer {
    return create(<Figure description="foo">{children}</Figure>);
}

test('renders a paragraph with the given description', (t) => {
    const { root } = renderFigure();
    const paragraphElement = root.findByType('p');

    t.deepEqual(paragraphElement.children, ['foo']);
});

test('renders any given children as sibling to paragraph', (t) => {
    const { root } = renderFigure(<span>bar</span>);
    const spanElement = root.findByType('span');

    t.deepEqual(spanElement.children, ['bar']);
});
