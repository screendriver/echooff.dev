export interface State {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly submitDisabled: boolean;
  readonly formSent: boolean;
}

interface StringAction {
  type: 'change-name' | 'change-email' | 'change-message';
  value: string;
}

interface BooleanAction {
  type: 'set-submit-disabled' | 'form-sent';
  value: boolean;
}

export type Action = StringAction | BooleanAction;

export const initialState: State = {
  name: '',
  email: '',
  message: '',
  submitDisabled: false,
  formSent: false,
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

export function setFormSent(sent: boolean): BooleanAction {
  return {
    type: 'form-sent',
    value: sent,
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
    case 'form-sent':
      return { ...state, formSent: action.value };
    default:
      return assertUnreachable(action);
  }
}
