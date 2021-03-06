import { assert } from 'chai';
import { render } from '@testing-library/react';
import { FormSent } from '../../../../../src/components/contact/form/formSent';

suite('<FormSent />', function () {
  test('renders "Thank you"', function () {
    const { queryByText } = render(<FormSent />);
    const text = queryByText('Thank you');
    assert.notEqual(text, null);
  });
});
