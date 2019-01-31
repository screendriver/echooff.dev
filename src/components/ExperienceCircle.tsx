import React from 'react';
import styled from '@emotion/styled';
import { white } from '../colors';

interface ExperienceCircleProps {
  from: string;
  to: string;
}

const Circle = styled.span({
  border: '1px solid #eee',
  borderRadius: '50%',
  backgroundColor: white,
  display: 'inline-flex',
  justifyContent: 'center',
  flexDirection: 'column',
  textTransform: 'uppercase',
  width: 150,
  height: 150,
});

const Text = styled.span({
  fontSize: 18,
  lineHeight: '26px',
});

export function ExperienceCircle(props: ExperienceCircleProps) {
  return (
    <Circle>
      <Text>{props.to}</Text> <Text>-</Text> <Text>{props.from}</Text>
    </Circle>
  );
}
