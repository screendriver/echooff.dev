import test from 'ava';
import sinon from 'sinon';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { Form, Props } from '../../../../../src/components/contact/form/';

function renderForm(overrides: Partial<Props> = {}) {
  const props: Props = {
    onSubmit: sinon.fake(),
    ...overrides,
  };
  return render(<Form {...props} />);
}

test.afterEach(cleanup);

test('renders a "Leave me a message" text', t => {
  const { queryByText } = renderForm();
  const actual = queryByText('Leave me a message');
  const expected = null;
  t.not(actual, expected);
});

test('renders a required "Name" input field', t => {
  const { getByPlaceholderText } = renderForm();
  const actual = getByPlaceholderText('Name') as HTMLInputElement;
  t.is(actual.required, true);
});

test('renders a required "Email" input field', t => {
  const { getByPlaceholderText } = renderForm();
  const actual = getByPlaceholderText('Email') as HTMLInputElement;
  t.is(actual.required, true);
});

test('renders a required "Message" textarea', t => {
  const { getByPlaceholderText } = renderForm();
  const actual = getByPlaceholderText('Message') as HTMLTextAreaElement;
  t.is(actual.required, true);
});

test('calls given onSubmit callback when form is submitted', t => {
  const onSubmit = sinon.fake();
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
  sinon.assert.calledWith(onSubmit, {
    name: 'My name',
    email: 'test@example.com',
    message: 'Test text',
  });
  t.pass();
});
