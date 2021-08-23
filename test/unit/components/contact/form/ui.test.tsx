import assert from 'assert';
import sinon from 'sinon';
import { render } from '@testing-library/react';
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

suite('<Contact />', function () {
  test('renders a translated heading', function () {
    const { queryByText } = renderFormUi({});
    const headingElement = queryByText('contact.leave_a_message');
    assert.notStrictEqual(headingElement, null);
  });

  test('render given name in an input', function () {
    const { getByPlaceholderText } = renderFormUi({ name: 'My name' });
    const input = getByPlaceholderText('contact.name') as HTMLInputElement;
    assert.strictEqual(input.value, 'My name');
  });

  test('render given email in an input', function () {
    const { getByPlaceholderText } = renderFormUi({ email: 'foo@example.com' });
    const input = getByPlaceholderText('contact.email') as HTMLInputElement;
    assert.strictEqual(input.value, 'foo@example.com');
  });

  test('render given message in a textarea', function () {
    const { getByPlaceholderText } = renderFormUi({ message: 'My message' });
    const textarea = getByPlaceholderText(
      'contact.message',
    ) as HTMLTextAreaElement;
    assert.strictEqual(textarea.value, 'My message');
  });

  test('render a enabled submit button', function () {
    const { getByDisplayValue } = renderFormUi({ submitDisabled: false });
    const submit = getByDisplayValue('contact.submit') as HTMLInputElement;
    assert.strictEqual(submit.disabled, false);
  });

  test('render a disabled submit button', function () {
    const { getByDisplayValue } = renderFormUi({ submitDisabled: true });
    const submit = getByDisplayValue('contact.submit') as HTMLInputElement;
    assert.strictEqual(submit.disabled, true);
  });
});
