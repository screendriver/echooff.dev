import test from 'tape';
import {
  reducer,
  initialState,
  State,
  changeName,
  changeEmail,
  changeMessage,
  setSubmitDisabled,
} from '../../../../../src/components/contact/form/reducer';

test('initial state', t => {
  t.plan(1);
  const expected: State = {
    name: '',
    email: '',
    message: '',
    submitDisabled: false,
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
  };
  t.deepEqual(actual, expected);
});
