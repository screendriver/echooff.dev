import { FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { white, black, cyan, light } from '../colors';

export enum ColorScheme {
  Cyan,
  Light,
}

interface SectionProps {
  heading: string;
  id: HTMLHeadingElement['id'];
  colorScheme: ColorScheme;
}

type ColorSchemeProps = Pick<SectionProps, 'colorScheme'>;

const SectionStyled = styled.section<ColorSchemeProps>((props) => ({
  backgroundColor: props.colorScheme === ColorScheme.Cyan ? cyan : light,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '50px 15px',
}));

const Heading = styled.h1<ColorSchemeProps>((props) => ({
  fontSize: 32,
  color: props.colorScheme === ColorScheme.Light ? black : white,
}));

const Line = styled.hr<ColorSchemeProps>((props) => ({
  height: 4,
  width: 70,
  marginBottom: 40,
  backgroundColor:
    props.colorScheme === ColorScheme.Light ? cyan : 'rgba(255, 255, 255, 0.3)',
  border: 0,
}));

export const Section: FunctionComponent<SectionProps> = (props) => {
  return (
    <SectionStyled id={props.id} colorScheme={props.colorScheme}>
      <Heading colorScheme={props.colorScheme}>{props.heading}</Heading>
      <Line colorScheme={props.colorScheme} />
      {props.children}
    </SectionStyled>
  );
};
