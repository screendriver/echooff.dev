import assert from 'assert'
import {
  Action,
  reducer,
  initialState,
  State,
  changeName,
  changeEmail,
  changeMessage,
  setSubmitDisabled,
  setFormSent,
} from '../../../../../src/components/contact/form/reducer';

suite('reducer', function () {
  test('initial state', function () {
    const expected: State = {
      name: '',
      email: '',
      message: '',
      submitDisabled: false,
      formSent: false,
    };
    assert.deepStrictEqual(initialState, expected);
  });

  test('change name', function () {
    const actual = reducer(initialState, changeName('Me'));
    const expected: State = {
      name: 'Me',
      email: '',
      message: '',
      submitDisabled: false,
      formSent: false,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('change email', function () {
    const actual = reducer(initialState, changeEmail('foo@example.com'));
    const expected: State = {
      name: '',
      email: 'foo@example.com',
      message: '',
      submitDisabled: false,
      formSent: false,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('change message', function () {
    const actual = reducer(initialState, changeMessage('Test'));
    const expected: State = {
      name: '',
      email: '',
      message: 'Test',
      submitDisabled: false,
      formSent: false,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('change submitDisabled', function () {
    const actual = reducer(initialState, setSubmitDisabled(true));
    const expected: State = {
      name: '',
      email: '',
      message: '',
      submitDisabled: true,
      formSent: false,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('change formSent', function () {
    const actual = reducer(initialState, setFormSent(true));
    const expected: State = {
      name: '',
      email: '',
      message: '',
      submitDisabled: false,
      formSent: true,
    };
    assert.deepStrictEqual(actual, expected);
  });

  test('throw error on unknown action type', function () {
    assert.throws(() =>
      reducer(initialState, { type: 'unknown' } as unknown as Action),
    );
  });
});
