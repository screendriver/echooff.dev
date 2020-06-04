import React, { FunctionComponent } from 'react';
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

export const Circle: FunctionComponent<ExperienceCircleProps> = (props) => {
  const { experience } = props;
  return (
    <CircleStyled className={props.className}>
      <Text aria-label="Experience to">{experience.to}</Text> <Text>-</Text>{' '}
      <Text aria-label="Experience from">{experience.from}</Text>
    </CircleStyled>
  );
};
