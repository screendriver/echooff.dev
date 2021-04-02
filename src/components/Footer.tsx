import { FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { Trans, useTranslation } from 'react-i18next';
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
  const [t] = useTranslation();
  const year = date.getFullYear();
  return (
    <FooterStyled aria-label="Footer">
      <Trans t={t} i18nKey="footer.copyright" values={{ year }}>
        Copyright &copy; year Christian Rackerseder. Design inspired by
        <a href="http://www.templatewire.com/">TemplateWire</a>
      </Trans>
    </FooterStyled>
  );
};
