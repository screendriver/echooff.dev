export interface State {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly submitDisabled: boolean;
}

interface StringAction {
  type: 'change-name' | 'change-email' | 'change-message';
  value: string;
}

interface BooleanAction {
  type: 'set-submit-disabled';
  value: boolean;
}

export type Action = StringAction | BooleanAction;

export const initialState: State = {
  name: '',
  email: '',
  message: '',
  submitDisabled: false,
};

export function changeName(value: string): StringAction {
  return {
    type: 'change-name',
    value,
  };
}

export function changeEmail(value: string): StringAction {
  return {
    type: 'change-email',
    value,
  };
}

export function changeMessage(value: string): StringAction {
  return {
    type: 'change-message',
    value,
  };
}

export function setSubmitDisabled(disabled: boolean): BooleanAction {
  return {
    type: 'set-submit-disabled',
    value: disabled,
  };
}

function assertUnreachable(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'change-name':
      return { ...state, name: action.value };
    case 'change-email':
      return { ...state, email: action.value };
    case 'change-message':
      return { ...state, message: action.value };
    case 'set-submit-disabled':
      return { ...state, submitDisabled: action.value };
    default:
      return assertUnreachable(action);
  }
}
