import assert from 'assert';
import sinon from 'sinon';
import { render, fireEvent } from '@testing-library/react';
import { Form, Props } from '../../../../../src/components/contact/form/';

function renderForm(overrides: Partial<Props> = {}) {
  const props: Props = {
    onSubmit: sinon.fake(),
    ...overrides,
  };
  return render(<Form {...props} />);
}

suite('<Form />', function () {
  test('renders a "Leave me a message" text', function () {
    const { queryByText } = renderForm();
    const actual = queryByText('contact.leave_a_message');
    const expected = null;
    assert.notStrictEqual(actual, expected);
  });

  test('renders a required "Name" input field', function () {
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('contact.name') as HTMLInputElement;
    assert.strictEqual(actual.required, true);
  });

  test('renders a required "Email" input field', function () {
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText('contact.email') as HTMLInputElement;
    assert.strictEqual(actual.required, true);
  });

  test('renders a required "Message" textarea', function () {
    const { getByPlaceholderText } = renderForm();
    const actual = getByPlaceholderText(
      'contact.message',
    ) as HTMLTextAreaElement;
    assert.strictEqual(actual.required, true);
  });

  test('calls given onSubmit callback when form is submitted', function () {
    const onSubmit = sinon.fake();
    const { getByPlaceholderText, getByDisplayValue } = renderForm({
      onSubmit,
    });
    const name = getByPlaceholderText('contact.name') as HTMLInputElement;
    const email = getByPlaceholderText('contact.email') as HTMLInputElement;
    const message = getByPlaceholderText(
      'contact.message',
    ) as HTMLTextAreaElement;
    const submitButton = getByDisplayValue(
      'contact.submit',
    ) as HTMLInputElement;
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
