import React from 'react';
import test from 'ava';
import { screen, render, cleanup } from '@testing-library/react';
import { Header } from '../../src/Header';

test.afterEach(cleanup);

test.serial('renders "Hello, I\'m Christian"', (t) => {
    render(<Header />);

    const actual = screen.queryByText("Hello, I'm Christian");
    const notExpected = null;
    t.not(actual, notExpected);
});

test.serial('renders "Full-Stack JavaScript Engineer"', (t) => {
    render(<Header />);

    const actual = screen.queryByText('Full-Stack JavaScript Engineer');
    const notExpected = null;
    t.not(actual, notExpected);
});
