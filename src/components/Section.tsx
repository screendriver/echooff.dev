import React, { FC } from 'react';
import styled from '@emotion/styled';

export enum SectionTheme {
  Cyan,
  White,
}

interface SectionProps {
  heading: string;
  theme: SectionTheme;
}

type ThemeProps = Pick<SectionProps, 'theme'>;

const SectionStyled = styled.section((props: ThemeProps) => ({
  backgroundColor: props.theme === SectionTheme.Cyan ? '#7bc3d1' : undefined,
  padding: '100px 0',
  textAlign: 'center',
}));

const Heading = styled.h1((props: ThemeProps) => ({
  fontSize: '2em',
  fontWeight: 400,
  color: props.theme === SectionTheme.White ? '#121d1f' : 'white',
}));

const Line = styled.hr((props: ThemeProps) => ({
  height: 4,
  width: 70,
  backgroundColor:
    props.theme === SectionTheme.White ? '#7bc3d1' : 'rgba(255, 255, 255, 0.3)',
  border: 0,
  marginBottom: 40,
}));

export const Section: FC<SectionProps> = props => {
  return (
    <SectionStyled theme={props.theme}>
      <Heading theme={props.theme}>{props.heading}</Heading>
      <Line theme={props.theme} />
      {props.children}
    </SectionStyled>
  );
};
