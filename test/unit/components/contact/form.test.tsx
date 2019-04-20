import React from 'react';
import test from 'tape';
import { render, fireEvent } from 'react-testing-library';
import sinon from 'sinon';
import { withCleanup } from '../../../cleanup';
import { ContactForm } from '../../../../src/components/contact/form';

function renderContactForm(onFormSent = sinon.stub()) {
  return render(<ContactForm onFormSent={onFormSent} />);
}

test(
  'renders "Leave me a message"',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = renderContactForm();
    getByText('Leave me a message');
    t.pass();
  }),
);

test(
  'renders a hidden contact input',
  withCleanup(t => {
    t.plan(1);
    const { getByDisplayValue } = renderContactForm();
    const input = getByDisplayValue('contact');
    t.equal(input.getAttribute('type'), 'hidden');
  }),
);

test(
  'keep the "name" input value',
  withCleanup(t => {
    t.plan(1);
    const { getByLabelText } = renderContactForm();
    const input = getByLabelText('name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'My name' } });
    t.equal(input.value, 'My name');
  }),
);

test(
  'keep the "email" input value',
  withCleanup(t => {
    t.plan(1);
    const { getByLabelText } = renderContactForm();
    const input = getByLabelText('email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'foo@example.com' } });
    t.equal(input.value, 'foo@example.com');
  }),
);

test(
  'show a "Message" placeholder',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderContactForm();
    getByPlaceholderText('Message');
    t.pass();
  }),
);

test(
  'keep the "message" textarea value',
  withCleanup(t => {
    t.plan(1);
    const { getByLabelText } = renderContactForm();
    const textarea = getByLabelText('message') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'foo@example.com' } });
    t.equal(textarea.value, 'foo@example.com');
  }),
);
