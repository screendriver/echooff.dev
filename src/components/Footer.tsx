import React, { FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { Trans } from 'react-i18next';
import { black, darkGrey, cyan } from '../colors';

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

export interface FooterProps {
  date: Date;
}

export const Footer: FunctionComponent<FooterProps> = ({ date }) => {
  const year = date.getFullYear();
  return (
    <FooterStyled>
      <Trans i18nKey="footer.copyright">
        Copyright &copy; {{ year }} Christian Rackerseder. Design inspired by
        <a href="http://www.templatewire.com/">TemplateWire</a>
      </Trans>
    </FooterStyled>
  );
};
