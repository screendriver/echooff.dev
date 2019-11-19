import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { FormSent } from '../../../../../src/components/contact/form/formSent';

suite('<FormSent />', function() {
  teardown(cleanup);

  test('renders "Thank you"', function() {
    const { getByText } = render(<FormSent />);
    getByText('Thank you');
  });
});
