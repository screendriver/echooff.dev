import React from 'react';
import test from 'ava';
import { create } from 'react-test-renderer';
import { Header } from '../../src/Header';

test('renders "Hello, I\'m Christian"', (t) => {
    const { root } = create(<Header />);
    const headerElement = root.findByType('header');
    const sectionElement = headerElement.findByType('section');
    const divElement = sectionElement.findByType('div');
    const heading1Element = divElement.findByType('h1');

    t.deepEqual(heading1Element.children, ["Hello, I'm Christian"]);
});

test('renders "Full-Stack JavaScript Engineer"', (t) => {
    const { root } = create(<Header />);
    const headerElement = root.findByType('header');
    const sectionElement = headerElement.findByType('section');
    const divElement = sectionElement.findByType('div');
    const heading2Element = divElement.findByType('h2');

    t.deepEqual(heading2Element.children, ['Full-Stack JavaScript Engineer']);
});
