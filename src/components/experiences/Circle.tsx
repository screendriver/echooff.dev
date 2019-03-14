import React from 'react';
import styled from '@emotion/styled';
import { white } from '../../colors';
import { Experience } from '.';

interface ExperienceCircleProps {
  experience: Experience;
  className?: string;
}

const CircleStyled = styled.span({
  border: '1px solid #eee',
  borderRadius: '50%',
  backgroundColor: white,
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  width: 80,
  height: 80,
  position: 'relative',
  '@media (min-width: 768px)': {
    width: 100,
    height: 100,
  },
  '@media (min-width: 1024px)': {
    width: 150,
    height: 150,
  },
});

const Text = styled.span({
  fontSize: 12,
  textTransform: 'uppercase',
  '@media (min-width: 768px)': {
    fontSize: 14,
  },
  '@media (min-width: 1024px)': {
    fontSize: 18,
  },
});

export function Circle(props: ExperienceCircleProps) {
  const { experience } = props;
  return (
    <CircleStyled className={props.className}>
      <Text>{experience.to}</Text> <Text>-</Text> <Text>{experience.from}</Text>
    </CircleStyled>
  );
}
