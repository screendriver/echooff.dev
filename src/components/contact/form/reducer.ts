export interface State {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly submitDisabled: boolean;
}

export interface Action {
  type: 'change-name' | 'change-email' | 'change-message';
  value: string;
}

export const initialState: State = {
  name: '',
  email: '',
  message: '',
  submitDisabled: false,
};

export function changeName(value: string): Action {
  return {
    type: 'change-name',
    value,
  };
}

export function changeEmail(value: string): Action {
  return {
    type: 'change-email',
    value,
  };
}

export function changeMessage(value: string): Action {
  return {
    type: 'change-message',
    value,
  };
}

function assertUnreachable(_x: never): never {
  throw new Error('Should not occur');
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'change-name':
      return { ...state, name: action.value };
    case 'change-email':
      return { ...state, email: action.value };
    case 'change-message':
      return { ...state, message: action.value };
    default:
      return assertUnreachable(action.type);
  }
}
