import React from 'react';
import test from 'tape';
import { render } from 'react-testing-library';
import { withCleanup } from '../../../cleanup';
import { ContactFormSent } from '../../../../src/components/contact/formSent';

test(
  'renders "Thank you"',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = render(<ContactFormSent />);
    getByText('Thank you');
    t.pass();
  }),
);
