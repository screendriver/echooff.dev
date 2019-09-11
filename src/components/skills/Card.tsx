import React from 'react';
import styled from '@emotion/styled';
import hexToRgba from 'hex-to-rgba';
import { black, darkerWhite, cyan, white } from '../../colors';

export interface CardProps {
  linkTo: string;
  linkText: string;
  icon: JSX.Element;
  description: string;
  className?: string;
}

const Link = styled.a({
  color: black,
  padding: 20,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
});

const Icon = styled.span({
  height: 50,
});

const Description = styled.p({
  fontSize: 14,
  lineHeight: 1.35,
  textAlign: 'center',
  marginTop: 25,
  '& span': {
    color: black,
    fontWeight: 'bold',
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
  backgroundColor: hexToRgba(white, '0.4'),
  width: 250,
  height: 190,
  marginBottom: 40,
  borderRadius: 10,
  boxShadow:
    '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12); ',
  transition: 'background-color 150ms',
  ':hover': {
    backgroundColor: hexToRgba(white, '0.5'),
  },
  ':nth-last-of-type(1)': {
    marginBottom: 0,
  },
  '@media (min-width: 768px)': {
    ':nth-last-of-type(-n+3)': {
      marginBottom: 0,
    },
  },
});

export function Card(props: CardProps) {
  return (
    <Section>
      <Link href={props.linkTo} title={props.linkText}>
        <Icon className={props.className}>{props.icon}</Icon>
        <Description>
          <span>{props.linkText}</span> {props.description}
        </Description>
      </Link>
    </Section>
  );
}
