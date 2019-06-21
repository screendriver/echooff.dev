import React from 'react';
import { Circle } from 'rc-progress';
import styled from '@emotion/styled';
import { white, black } from '../colors';

interface ProgressProps {
  percent: number;
  description: string;
  className?: string;
}

const Wrapper = styled.div({
  width: 100,
  '@media (min-width: 768px)': {
    width: 150,
  },
});

const CircleWrapper = styled.div({
  position: 'relative',
});

const Percent = styled.span({
  fontSize: 21,
  color: black,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  '::after': {
    content: "'%'",
    fontSize: '0.8em',
    marginLeft: '0.1em',
  },
});

const Description = styled.h4({
  textAlign: 'center',
  color: white,
  fontSize: 20,
  fontWeight: 600,
});

export function Progress({ percent, description, className }: ProgressProps) {
  return (
    <>
      <Wrapper className={className}>
        <CircleWrapper>
          <Percent>{percent}</Percent>
          <Circle
            percent={percent}
            strokeWidth={5}
            trailWidth={5}
            trailColor={white}
            strokeColor="#121d1f"
            strokeLinecap="butt"
          />
        </CircleWrapper>
      </Wrapper>
      <Description>{description}</Description>
    </>
  );
}
