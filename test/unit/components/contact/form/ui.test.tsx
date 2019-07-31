import React from 'react';
import test from 'tape';
import { render } from '@testing-library/react';
import sinon from 'sinon';
import { withCleanup } from '../../../../cleanup';
import { FormUi, Props } from '../../../../../src/components/contact/form/ui';

function renderFormUi(overrides: Partial<Props>) {
  const props: Props = {
    name: '',
    email: '',
    message: '',
    submitDisabled: false,
    onInputChange: sinon.stub(),
    onSubmit: sinon.stub(),
    ...overrides,
  };
  return render(<FormUi {...props} />);
}

test(
  'render given name in an input',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderFormUi({ name: 'My name' });
    const input = getByPlaceholderText('Name') as HTMLInputElement;
    t.equal(input.value, 'My name');
  }),
);

test(
  'render given email in an input',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderFormUi({ email: 'foo@example.com' });
    const input = getByPlaceholderText('Email') as HTMLInputElement;
    t.equal(input.value, 'foo@example.com');
  }),
);

test(
  'render given message in a textarea',
  withCleanup(t => {
    t.plan(1);
    const { getByPlaceholderText } = renderFormUi({ message: 'My message' });
    const textarea = getByPlaceholderText('Message') as HTMLTextAreaElement;
    t.equal(textarea.value, 'My message');
  }),
);

test(
  'render a enabled submit button',
  withCleanup(t => {
    t.plan(1);
    const { getByDisplayValue } = renderFormUi({ submitDisabled: false });
    const submit = getByDisplayValue('Send Message') as HTMLInputElement;
    t.equal(submit.disabled, false);
  }),
);

test(
  'render a disabled submit button',
  withCleanup(t => {
    t.plan(1);
    const { getByDisplayValue } = renderFormUi({ submitDisabled: true });
    const submit = getByDisplayValue('Send Message') as HTMLInputElement;
    t.equal(submit.disabled, true);
  }),
);
