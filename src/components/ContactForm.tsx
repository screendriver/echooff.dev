import React, {
  Dispatch,
  ChangeEvent,
  useState,
  SetStateAction,
  FormEvent,
} from 'react';
import styled from '@emotion/styled';
import ky from 'ky';
import formurlencoded from 'form-urlencoded';
import { white } from '../colors';

const Heading = styled.h3({
  color: white,
  marginTop: 30,
  marginBottom: 30,
});

const Form = styled.form({
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: 500,
});

const commonStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  color: '#2c3e50',
  borderWidth: 0,
  borderRadius: 4,
  height: 34,
  width: '47%',
  padding: '6px 12px',
};

const Input = styled.input(commonStyle);

const TextArea = styled.textarea({
  ...commonStyle,
  height: 'initial',
  width: 'initial',
  marginBottom: 20,
});

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20,
});

const Submit = styled.input({
  backgroundColor: 'transparent',
  border: `1px solid ${white}`,
  color: white,
  margin: '0 140px',
  padding: '10px 20px',
});

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
      <Heading>Leave me a message</Heading>
      <Form
        name="contact"
        method="POST"
        data-netlify="true"
        onSubmit={handleSubmit(props, state, setState)}
      >
        <input type="hidden" name="form-name" value="contact" />
        <Row>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            value={state.name}
            required={true}
            onChange={handleInputChange(setState)}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={state.email}
            required={true}
            onChange={handleInputChange(setState)}
          />
        </Row>
        <TextArea
          name="message"
          rows={4}
          placeholder="Message"
          value={state.message}
          required={true}
          onChange={handleInputChange(setState)}
        />
        <Submit type="submit" value="Send Message" />
      </Form>
    </>
  );
}
