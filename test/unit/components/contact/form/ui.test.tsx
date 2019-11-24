import { assert } from 'chai';
import sinon from 'sinon';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { FormUi, Props } from '../../../../../src/components/contact/form/ui';

function renderFormUi(overrides: Partial<Props>) {
  const props: Props = {
    name: '',
    email: '',
    message: '',
    submitDisabled: false,
    onInputChange: sinon.fake(),
    onSubmit: sinon.fake(),
    ...overrides,
  };
  return render(<FormUi {...props} />);
}

suite('<Contact />', () => {
  teardown(cleanup);

  test('render given name in an input', () => {
    const { getByPlaceholderText } = renderFormUi({ name: 'My name' });
    const input = getByPlaceholderText('Name') as HTMLInputElement;
    assert.equal(input.value, 'My name');
  });

  test('render given email in an input', () => {
    const { getByPlaceholderText } = renderFormUi({ email: 'foo@example.com' });
    const input = getByPlaceholderText('Email') as HTMLInputElement;
    assert.equal(input.value, 'foo@example.com');
  });

  test('render given message in a textarea', () => {
    const { getByPlaceholderText } = renderFormUi({ message: 'My message' });
    const textarea = getByPlaceholderText('Message') as HTMLTextAreaElement;
    assert.equal(textarea.value, 'My message');
  });

  test('render a enabled submit button', () => {
    const { getByDisplayValue } = renderFormUi({ submitDisabled: false });
    const submit = getByDisplayValue('Send Message') as HTMLInputElement;
    assert.isFalse(submit.disabled);
  });

  test('render a disabled submit button', () => {
    const { getByDisplayValue } = renderFormUi({ submitDisabled: true });
    const submit = getByDisplayValue('Send Message') as HTMLInputElement;
    assert.isTrue(submit.disabled);
  });
});
