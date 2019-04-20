export interface State {
  name: string;
  email: string;
  message: string;
}

export interface Action {
  type: 'change-name' | 'change-email' | 'change-message';
  value: string;
}

export const initialState: State = {
  name: '',
  email: '',
  message: '',
};

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
