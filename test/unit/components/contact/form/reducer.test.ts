import test from 'tape';
import {
  reducer,
  initialState,
  State,
  changeName,
  changeEmail,
  changeMessage,
  setSubmitDisabled,
  setFormSent,
} from '../../../../../src/components/contact/form/reducer';

test('initial state', t => {
  t.plan(1);
  const expected: State = {
    name: '',
    email: '',
    message: '',
    submitDisabled: false,
    formSent: false,
  };
  t.deepEqual(initialState, expected);
});

test('change name', t => {
  t.plan(1);
  const actual = reducer(initialState, changeName('Me'));
  const expected: State = {
    name: 'Me',
    email: '',
    message: '',
    submitDisabled: false,
    formSent: false,
  };
  t.deepEqual(actual, expected);
});

test('change email', t => {
  t.plan(1);
  const actual = reducer(initialState, changeEmail('foo@example.com'));
  const expected: State = {
    name: '',
    email: 'foo@example.com',
    message: '',
    submitDisabled: false,
    formSent: false,
  };
  t.deepEqual(actual, expected);
});

test('change message', t => {
  t.plan(1);
  const actual = reducer(initialState, changeMessage('Test'));
  const expected: State = {
    name: '',
    email: '',
    message: 'Test',
    submitDisabled: false,
    formSent: false,
  };
  t.deepEqual(actual, expected);
});

test('change submitDisabled', t => {
  t.plan(1);
  const actual = reducer(initialState, setSubmitDisabled(true));
  const expected: State = {
    name: '',
    email: '',
    message: '',
    submitDisabled: true,
    formSent: false,
  };
  t.deepEqual(actual, expected);
});

test('change formSent', t => {
  t.plan(1);
  const actual = reducer(initialState, setFormSent(true));
  const expected: State = {
    name: '',
    email: '',
    message: '',
    submitDisabled: false,
    formSent: true,
  };
  t.deepEqual(actual, expected);
});
