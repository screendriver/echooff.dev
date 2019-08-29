import React from 'react';
import { render } from '@testing-library/react';
import { FormUi, Props } from '../../../../../src/components/contact/form/ui';

function renderFormUi(overrides: Partial<Props>) {
  const props: Props = {
    name: '',
    email: '',
    message: '',
    submitDisabled: false,
    onInputChange: jest.fn(),
    onSubmit: jest.fn(),
    ...overrides,
  };
  return render(<FormUi {...props} />);
}

test('render given name in an input', () => {
  const { getByPlaceholderText } = renderFormUi({ name: 'My name' });
  const input = getByPlaceholderText('Name') as HTMLInputElement;
  expect(input.value).toBe('My name');
});

test('render given email in an input', () => {
  const { getByPlaceholderText } = renderFormUi({ email: 'foo@example.com' });
  const input = getByPlaceholderText('Email') as HTMLInputElement;
  expect(input.value).toBe('foo@example.com');
});

test('render given message in a textarea', () => {
  const { getByPlaceholderText } = renderFormUi({ message: 'My message' });
  const textarea = getByPlaceholderText('Message') as HTMLTextAreaElement;
  expect(textarea.value).toBe('My message');
});

test('render a enabled submit button', () => {
  const { getByDisplayValue } = renderFormUi({ submitDisabled: false });
  const submit = getByDisplayValue('Send Message') as HTMLInputElement;
  expect(submit.disabled).toBe(false);
});

test('render a disabled submit button', () => {
  const { getByDisplayValue } = renderFormUi({ submitDisabled: true });
  const submit = getByDisplayValue('Send Message') as HTMLInputElement;
  expect(submit.disabled).toBe(true);
});
