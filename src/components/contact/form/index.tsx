import React, { useReducer, Dispatch, ChangeEvent, FormEvent } from 'react';
import {
  reducer,
  initialState,
  Action,
  State,
  changeName,
  changeEmail,
  changeMessage,
  setSubmitDisabled,
  setFormSent,
} from './reducer';
import { FormUi } from './ui';
import { sendForm } from './send';
import { FormSent } from './formSent';

function handleInputChange(dispatch: Dispatch<Action>) {
  return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, name } = event.target;
    switch (name) {
      case 'name':
        dispatch(changeName(value));
        break;
      case 'email':
        dispatch(changeEmail(value));
        break;
      case 'message':
        dispatch(changeMessage(value));
        break;
    }
  };
}

function handleSubmit(state: State, dispatch: Dispatch<Action>) {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setSubmitDisabled(true));
    const { name, email, message } = state;
    await sendForm({ name, email, message });
    dispatch(setSubmitDisabled(false));
    dispatch(setFormSent(true));
  };
}

export function Form() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return state.formSent ? (
    <FormSent />
  ) : (
    <FormUi
      name={state.name}
      email={state.email}
      message={state.message}
      submitDisabled={state.submitDisabled}
      onInputChange={handleInputChange(dispatch)}
      onSubmit={handleSubmit(state, dispatch)}
    />
  );
}
