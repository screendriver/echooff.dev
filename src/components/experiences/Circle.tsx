import React, { FC } from 'react';
import styled from '@emotion/styled';
import { white } from '../../colors';

interface ExperienceCircleProps {
  from: string;
  to: string;
  childPosition: 'left' | 'right';
}

const Wrapper = styled.div({
  position: 'relative',
});

const CircleStyled = styled.span({
  border: '1px solid #eee',
  borderRadius: '50%',
  backgroundColor: white,
  display: 'inline-flex',
  justifyContent: 'center',
  flexDirection: 'column',
  width: 150,
  height: 150,
  position: 'relative',
});

const Text = styled.span({
  fontSize: 18,
  lineHeight: '26px',
  textTransform: 'uppercase',
});

const ChildrenWrapper = styled.div(
  (props: Pick<ExperienceCircleProps, 'childPosition'>) => {
    const positionFlipped = props.childPosition === 'left' ? 'right' : 'left';
    return {
      position: 'absolute',
      top: 15,
      [positionFlipped]: 200,
      width: 350,
      textAlign: positionFlipped,
    };
  },
);

export const Circle: FC<ExperienceCircleProps> = props => {
  return (
    <Wrapper>
      <CircleStyled>
        <Text>{props.to}</Text> <Text>-</Text> <Text>{props.from}</Text>
        <ChildrenWrapper childPosition={props.childPosition}>
          {props.children}
        </ChildrenWrapper>
      </CircleStyled>
    </Wrapper>
  );
};
