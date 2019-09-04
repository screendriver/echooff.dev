import test from 'ava';
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

test.afterEach(cleanup);

test('render given name in an input', t => {
  const { getByPlaceholderText } = renderFormUi({ name: 'My name' });
  const input = getByPlaceholderText('Name') as HTMLInputElement;
  t.is(input.value, 'My name');
});

test('render given email in an input', t => {
  const { getByPlaceholderText } = renderFormUi({ email: 'foo@example.com' });
  const input = getByPlaceholderText('Email') as HTMLInputElement;
  t.is(input.value, 'foo@example.com');
});

test('render given message in a textarea', t => {
  const { getByPlaceholderText } = renderFormUi({ message: 'My message' });
  const textarea = getByPlaceholderText('Message') as HTMLTextAreaElement;
  t.is(textarea.value, 'My message');
});

test('render a enabled submit button', t => {
  const { getByDisplayValue } = renderFormUi({ submitDisabled: false });
  const submit = getByDisplayValue('Send Message') as HTMLInputElement;
  t.is(submit.disabled, false);
});

test('render a disabled submit button', t => {
  const { getByDisplayValue } = renderFormUi({ submitDisabled: true });
  const submit = getByDisplayValue('Send Message') as HTMLInputElement;
  t.is(submit.disabled, true);
});
