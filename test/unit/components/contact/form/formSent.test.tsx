import test from 'ava';
import React from 'react';
import { render } from '@testing-library/react';
import { FormSent } from '../../../../../src/components/contact/form/formSent';

test('renders "Thank you"', t => {
  const { getByText } = render(<FormSent />);
  getByText('Thank you');
  t.pass();
});
