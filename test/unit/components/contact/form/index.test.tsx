import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Form, Props } from '../../../../../src/components/contact/form/';

function renderForm(overrides: Partial<Props> = {}) {
  const props: Props = {
    onSubmit: jest.fn(),
    ...overrides,
  };
  return render(<Form {...props} />);
}

test('renders a "Leave me a message" text', () => {
  const { queryByText } = renderForm();
  const actual = queryByText('Leave me a message');
  const expected = null;
  expect(actual).not.toEqual(expected);
});

test('renders a required "Name" input field', () => {
  const { getByPlaceholderText } = renderForm();
  const actual = getByPlaceholderText('Name') as HTMLInputElement;
  const expected = true;
  expect(actual.required).toEqual(expected);
});

test('renders a required "Email" input field', () => {
  const { getByPlaceholderText } = renderForm();
  const actual = getByPlaceholderText('Email') as HTMLInputElement;
  const expected = true;
  expect(actual.required).toBe(expected);
});

test('renders a required "Message" textarea', () => {
  const { getByPlaceholderText } = renderForm();
  const actual = getByPlaceholderText('Message') as HTMLTextAreaElement;
  const expected = true;
  expect(actual.required).toBe(expected);
});

test('calls given onSubmit callback when form is submitted', () => {
  const onSubmit = jest.fn();
  const { getByPlaceholderText, getByDisplayValue } = renderForm({
    onSubmit,
  });
  const name = getByPlaceholderText('Name') as HTMLInputElement;
  const email = getByPlaceholderText('Email') as HTMLInputElement;
  const message = getByPlaceholderText('Message') as HTMLTextAreaElement;
  const submitButton = getByDisplayValue('Send Message') as HTMLInputElement;
  fireEvent.change(name, { target: { name: 'name', value: 'My name' } });
  fireEvent.change(email, {
    target: { name: 'email', value: 'test@example.com' },
  });
  fireEvent.change(message, {
    target: { name: 'message', value: 'Test text' },
  });
  fireEvent.click(submitButton);
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'My name',
    email: 'test@example.com',
    message: 'Test text',
  });
});
