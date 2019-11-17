import { expect } from 'chai';
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

suite('reducer', () => {
  test('initial state', () => {
    const expected: State = {
      name: '',
      email: '',
      message: '',
      submitDisabled: false,
      formSent: false,
    };
    expect(initialState).to.deep.equal(expected);
  });

  test('change name', () => {
    const actual = reducer(initialState, changeName('Me'));
    const expected: State = {
      name: 'Me',
      email: '',
      message: '',
      submitDisabled: false,
      formSent: false,
    };
    expect(actual).to.deep.equal(expected);
  });

  test('change email', () => {
    const actual = reducer(initialState, changeEmail('foo@example.com'));
    const expected: State = {
      name: '',
      email: 'foo@example.com',
      message: '',
      submitDisabled: false,
      formSent: false,
    };
    expect(actual).to.deep.equal(expected);
  });

  test('change message', () => {
    const actual = reducer(initialState, changeMessage('Test'));
    const expected: State = {
      name: '',
      email: '',
      message: 'Test',
      submitDisabled: false,
      formSent: false,
    };
    expect(actual).to.deep.equal(expected);
  });

  test('change submitDisabled', () => {
    const actual = reducer(initialState, setSubmitDisabled(true));
    const expected: State = {
      name: '',
      email: '',
      message: '',
      submitDisabled: true,
      formSent: false,
    };
    expect(actual).to.deep.equal(expected);
  });

  test('change formSent', () => {
    const actual = reducer(initialState, setFormSent(true));
    const expected: State = {
      name: '',
      email: '',
      message: '',
      submitDisabled: false,
      formSent: true,
    };
    expect(actual).to.deep.equal(expected);
  });

  test('throw error on unknown action type', () => {
    expect(() =>
      reducer(initialState, ({ type: 'unknown' } as unknown) as Action),
    ).to.throw();
  });
});
