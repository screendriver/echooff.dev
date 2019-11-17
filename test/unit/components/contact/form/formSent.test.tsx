import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { FormSent } from '../../../../../src/components/contact/form/formSent';

suite('<FormSent />', () => {
  teardown(cleanup);

  test('renders "Thank you"', () => {
    const { getByText } = render(<FormSent />);
    getByText('Thank you');
  });
});
