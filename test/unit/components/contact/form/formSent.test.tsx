import React from 'react';
import test from 'tape';
import { render } from 'react-testing-library';
import { withCleanup } from '../../../../cleanup';
import { FormSent } from '../../../../../src/components/contact/form/formSent';

test(
  'renders "Thank you"',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = render(<FormSent />);
    getByText('Thank you');
    t.pass();
  }),
);
