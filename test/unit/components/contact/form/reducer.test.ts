import test from 'tape';
import {
  reducer,
  initialState,
  State,
} from '../../../../../src/components/contact/form/reducer';

test('initial state', t => {
  t.plan(1);
  const expected: State = {
    name: '',
    email: '',
    message: '',
  };
  t.deepEqual(initialState, expected);
});

test('set name on change-name action', t => {
  t.plan(1);
  const actual = reducer(initialState, { type: 'change-name', value: 'Me' });
  const expected: State = {
    name: 'Me',
    email: '',
    message: '',
  };
  t.deepEqual(actual, expected);
});

test('set email on change-email action', t => {
  t.plan(1);
  const actual = reducer(initialState, {
    type: 'change-email',
    value: 'foo@example.com',
  });
  const expected: State = {
    name: '',
    email: 'foo@example.com',
    message: '',
  };
  t.deepEqual(actual, expected);
});

test('set message on change-message action', t => {
  t.plan(1);
  const actual = reducer(initialState, {
    type: 'change-message',
    value: 'Test',
  });
  const expected: State = {
    name: '',
    email: '',
    message: 'Test',
  };
  t.deepEqual(actual, expected);
});
