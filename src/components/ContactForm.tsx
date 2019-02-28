import React, {
  Dispatch,
  ChangeEvent,
  useState,
  SetStateAction,
  FormEvent,
} from 'react';
import ky from 'ky';
import formurlencoded from 'form-urlencoded';

interface Props {
  onFormSent(): void;
}

interface State {
  name: string;
  email: string;
  message: string;
}

function handleInputChange(setState: Dispatch<SetStateAction<State>>) {
  return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.persist();
    setState(prevState => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };
}

const initialState: State = {
  name: '',
  email: '',
  message: '',
};

function handleSubmit(
  props: Props,
  state: State,
  setState: Dispatch<SetStateAction<State>>,
) {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await ky.post('/', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formurlencoded({ 'form-name': 'contact', ...state }),
    });
    setState(initialState);
    props.onFormSent();
  };
}

export function ContactForm(props: Props) {
  const [state, setState] = useState<State>(initialState);
  return (
    <>
      <h3>Leave me a message</h3>
      <form
        name="contact"
        method="POST"
        data-netlify="true"
        onSubmit={handleSubmit(props, state, setState)}
      >
        <input type="hidden" name="form-name" value="contact" />
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={state.name}
          required={true}
          onChange={handleInputChange(setState)}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={state.email}
          required={true}
          onChange={handleInputChange(setState)}
        />
        <textarea
          name="message"
          rows={4}
          placeholder="Message"
          value={state.message}
          required={true}
          onChange={handleInputChange(setState)}
        />
        <input type="submit" value="Send Message" />
      </form>
    </>
  );
}
