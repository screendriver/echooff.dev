import React from 'react';
import styled from '@emotion/styled';
import { white, black, darkerWhite, cyan } from '../../colors';

interface CardProps {
  linkTo: string;
  linkText: string;
  icon: JSX.Element;
  description: string;
  className?: string;
}

const IconLink = styled.a({
  position: 'absolute',
  top: -15,
  width: 70,
});

const Description = styled.p({
  marginTop: 80,
  // textAlign: 'center',
  lineHeight: 1.35,
  '& a': {
    color: black,
    fontWeight: 'bold',
    textDecoration: 'none',
    position: 'relative',
    '::after': {
      content: '""',
      height: 2,
      background: `linear-gradient(to right,${darkerWhite},${cyan})`,
      width: '100%',
      position: 'absolute',
      left: 0,
      bottom: -2,
      borderRadius: 2,
    },
  },
});

const Section = styled.section({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: white,
  width: 250,
  height: 200,
  padding: 10,
  borderRadius: 4,
  boxShadow:
    '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12); ',
});

export function Card(props: CardProps) {
  return (
    <Section>
      <IconLink className={props.className} href={props.linkTo}>
        {props.icon}
      </IconLink>
      <Description>
        <a href={props.linkTo}>{props.linkText}</a> {props.description}
      </Description>
    </Section>
  );
}
