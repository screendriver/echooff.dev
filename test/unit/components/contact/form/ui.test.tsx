import { expect } from 'chai';
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
    expect(input.value).to.equal('My name');
  });

  test('render given email in an input', () => {
    const { getByPlaceholderText } = renderFormUi({ email: 'foo@example.com' });
    const input = getByPlaceholderText('Email') as HTMLInputElement;
    expect(input.value).to.equal('foo@example.com');
  });

  test('render given message in a textarea', () => {
    const { getByPlaceholderText } = renderFormUi({ message: 'My message' });
    const textarea = getByPlaceholderText('Message') as HTMLTextAreaElement;
    expect(textarea.value).to.equal('My message');
  });

  test('render a enabled submit button', () => {
    const { getByDisplayValue } = renderFormUi({ submitDisabled: false });
    const submit = getByDisplayValue('Send Message') as HTMLInputElement;
    expect(submit.disabled).to.equal(false);
  });

  test('render a disabled submit button', () => {
    const { getByDisplayValue } = renderFormUi({ submitDisabled: true });
    const submit = getByDisplayValue('Send Message') as HTMLInputElement;
    expect(submit.disabled).to.equal(true);
  });
});
