import { assert } from 'chai';
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

suite('<Form />', function() {
  teardown(cleanup);

  test('renders a "Leave me a message" text', function() {
    const { queryByText } = renderForm();
    const actual = queryByText('Leave me a message');
    const expected = null;
    assert.notEqual(actual, expected);
  });

  test('renders a required "Name" input field', function() {
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('Name') as HTMLInputElement;
    assert.isTrue(actual.required);
  });

  test('renders a required "Email" input field', function() {
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('Email') as HTMLInputElement;
    assert.isTrue(actual.required);
  });

  test('renders a required "Message" textarea', function() {
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('Message') as HTMLTextAreaElement;
    assert.isTrue(actual.required);
  });

  test('calls given onSubmit callback when form is submitted', function() {
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
  });
});
