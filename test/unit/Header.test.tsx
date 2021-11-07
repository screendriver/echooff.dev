import React from 'react';
import test from 'ava';
import { render, cleanup } from '@testing-library/react';
import { Header } from '../../src/Header';

test.afterEach(cleanup);

test.serial('renders "Hello, I\'m Christian"', (t) => {
  const { queryByText } = render(<Header />);

  const actual = queryByText("Hello, I'm Christian");
  const notExpected = null;
  t.not(actual, notExpected);
});

test.serial('renders "Full-Stack JavaScript Engineer"', (t) => {
  const { queryByText } = render(<Header />);

  const actual = queryByText('Full-Stack JavaScript Engineer');
  const notExpected = null;
  t.not(actual, notExpected);
});
