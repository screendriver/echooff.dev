import React from 'react';
import { render } from '@testing-library/react';
import { Header } from '../../../src/Header';

suite.only('<Header />', function () {
  test('foo', function () {
    const { debug } = render(<Header />);
    debug();
  });
});
