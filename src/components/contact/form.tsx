import React, {
  Dispatch,
  ChangeEvent,
  useState,
  SetStateAction,
  FormEvent,
} from 'react';
import { css } from '@emotion/core';
import styled from '@emotion/styled';
import ky from 'ky-universal';
import formurlencoded from 'form-urlencoded';
import { white, grey } from '../../colors';

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
  alignItems: 'center',
  width: '100%',
  '@media (min-width: 425px)': {
    width: '80%',
  },
  '@media (min-width: 768px)': {
    width: 500,
  },
});

const inputStyle = css({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  color: '#2c3e50',
  borderWidth: 0,
  borderRadius: 4,
  height: 34,
  padding: '6px 12px',
  outline: 'unset',
});

const Input = styled.input(inputStyle, {
  marginBottom: 20,
  '@media (min-width: 768px)': {
    width: '48%',
  },
});

const TextArea = styled.textarea(inputStyle, {
  height: 'initial',
  width: '100%',
});

const Row = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  '@media (min-width: 768px)': {
    flexDirection: 'row',
  },
});

const Submit = styled.input({
  backgroundColor: 'transparent',
  border: `1px solid ${white}`,
  color: white,
  marginTop: 20,
  padding: '10px 20px',
  width: 200,
  transition: 'box-shadow 0.2s',
  ':hover': {
    cursor: 'pointer',
    boxShadow: '0 0 10px white',
  },
  ':disabled': {
    cursor: 'not-allowed',
    boxShadow: 'none',
    color: grey,
  },
});

interface Props {
  onFormSent(): void;
}

interface State {
  name: string;
  email: string;
  message: string;
  submitDisabled: boolean;
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
  submitDisabled: false,
};

function handleSubmit(
  props: Props,
  state: State,
  setState: Dispatch<SetStateAction<State>>,
) {
  return async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(prevState => ({ ...prevState, submitDisabled: true }));
    const { submitDisabled, ...formValues } = state;
    await ky.post('/', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formurlencoded({ 'form-name': 'contact', ...formValues }),
    });
    setState(initialState);
    props.onFormSent();
  };
}

export function ContactForm(props: Props) {
  const [state, setState] = useState(initialState);
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
            aria-label="name"
            type="text"
            placeholder="Name"
            value={state.name}
            required={true}
            onChange={handleInputChange(setState)}
          />
          <Input
            name="email"
            aria-label="email"
            type="email"
            placeholder="Email"
            value={state.email}
            required={true}
            onChange={handleInputChange(setState)}
          />
        </Row>
        <TextArea
          name="message"
          aria-label="message"
          rows={4}
          // cols={10}
          placeholder="Message"
          value={state.message}
          required={true}
          onChange={handleInputChange(setState)}
        />
        <Submit
          type="submit"
          value="Send Message"
          disabled={state.submitDisabled}
        />
      </Form>
    </>
  );
}
