import React, { ChangeEvent } from 'react';
import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { white, grey } from '../../../colors';

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

export interface Props {
  name: string;
  email: string;
  message: string;
  submitDisabled: boolean;
  onInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void;
  onSubmit(): void;
}

export function FormUi(props: Props) {
  return (
    <>
      <Heading>Leave me a message</Heading>
      <Form
        name="contact"
        method="POST"
        data-netlify="true"
        onSubmit={props.onSubmit}
      >
        <input type="hidden" name="form-name" value="contact" />
        <Row>
          <Input
            name="name"
            aria-label="Name"
            type="text"
            placeholder="Name"
            value={props.name}
            required={true}
            onChange={props.onInputChange}
          />
          <Input
            name="email"
            aria-label="Email"
            type="email"
            placeholder="Email"
            value={props.email}
            required={true}
            onChange={props.onInputChange}
          />
        </Row>
        <TextArea
          name="message"
          aria-label="Message"
          rows={4}
          placeholder="Message"
          value={props.message}
          required={true}
          onChange={props.onInputChange}
        />
        <Submit
          type="submit"
          value="Send Message"
          disabled={props.submitDisabled}
        />
      </Form>
    </>
  );
}
