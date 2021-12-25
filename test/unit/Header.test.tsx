import React from 'react';
import test from 'ava';
import { create } from 'react-test-renderer';
import { Header } from '../../src/Header';

test('renders "$ whoami"', (t) => {
    const { root } = create(<Header />);
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(0)?.children, ['$ whoami']);
});

test('renders "Christian"', (t) => {
    const { root } = create(<Header />);
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(1)?.children, ['Christian']);
});

test('renders "$ groups"', (t) => {
    const { root } = create(<Header />);
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(2)?.children, ['$ groups']);
});

test('renders "Full-Stack JavaScript Engineer"', (t) => {
    const { root } = create(<Header />);
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(3)?.children, ['Full-Stack JavaScript Engineer']);
});
