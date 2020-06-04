import React from 'react';
import { assert } from 'chai';
import { render, cleanup } from '@testing-library/react';
import { FormSent } from '../../../../../src/components/contact/form/formSent';

suite('<FormSent />', function () {
  test('renders "Thank you"', async function () {
    const { queryByText } = render(<FormSent />);
    const text = queryByText('Thank you');
    assert.notEqual(text, null);
    await cleanup();
  });
});
