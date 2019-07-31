import React from 'react';
import test from 'tape';
import { render, fireEvent } from '@testing-library/react';
import sinon from 'sinon';
import { withCleanup } from '../../../../cleanup';
import { Form, Props } from '../../../../../src/components/contact/form/';

function renderForm(overrides: Partial<Props> = {}) {
  const props: Props = {
    onSubmit: sinon.fake(),
    ...overrides,
  };
  return render(<Form {...props} />);
}

test(
  'renders a "Leave me a message" text',
  withCleanup(t => {
    t.plan(1);
    const { queryByText } = renderForm();
    const actual = queryByText('Leave me a message');
    const expected = null;
    t.notEqual(actual, expected);
  }),
);

test(
  'renders a required "Name" input field',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('Name') as HTMLInputElement;
    const expected = true;
    t.equal(actual.required, expected);
  }),
);

test(
  'renders a required "Email" input field',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('Email') as HTMLInputElement;
    const expected = true;
    t.equal(actual.required, expected);
  }),
);

test(
  'renders a required "Message" textarea',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('Message') as HTMLTextAreaElement;
    const expected = true;
    t.equal(actual.required, expected);
  }),
);

test(
  'calls given onSubmit callback when form is submitted',
  withCleanup(t => {
    t.plan(1);
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
    const actual = onSubmit.calledWith({
      name: 'My name',
      email: 'test@example.com',
      message: 'Test text',
    });
    const expected = true;
    t.equal(actual, expected);
  }),
);
