import React from 'react';
import styled from '@emotion/styled';
import { black, darkGrey, cyan } from '../colors';
import { Config } from '../shared/config';

const FooterStyled = styled.footer({
  backgroundColor: black,
  color: darkGrey,
  padding: '30px 0 25px',
  textAlign: 'center',
  fontSize: 13,
  a: {
    color: '#a0a5a5',
    textDecoration: 'none',
  },
  'a:hover': {
    color: cyan,
  },
});

interface FooterProps {
  config: Config;
}

export function Footer({ config: { visualRegressionTest } }: FooterProps) {
  return (
    <FooterStyled>
      Copyright &copy; {visualRegressionTest ? 2019 : new Date().getFullYear()}{' '}
      Christian Rackerseder. Design inspired by{' '}
      <a href="http://www.templatewire.com/">TemplateWire</a>
    </FooterStyled>
  );
}
