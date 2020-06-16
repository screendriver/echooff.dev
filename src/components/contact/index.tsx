import React, { FunctionComponent } from 'react';
import {
  MapPin,
  MessageSquare,
  Twitter,
  GitHub,
  Linkedin,
} from 'react-feather';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { Section, ColorScheme } from '../Section';
import { black, white } from '../../colors';
import { Form } from './form';
import { sendForm } from './form/send';

const Address = styled.address({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  fontStyle: 'normal',
});

const LinkList = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-evenly',
  textAlign: 'center',
  a: {
    color: black,
    textDecoration: 'none',
  },
  '@media (min-width: 768px)': {
    width: 450,
  },
});

const SmallLinkList = styled(LinkList)({
  marginTop: 50,
  '@media (min-width: 768px)': {
    width: 300,
  },
});

const BigLink = styled.a({
  width: '50%',
});

const SmallLink = styled.a({
  svg: {
    stroke: white,
    transition: 'stroke 0.3s',
  },
  'svg:hover': {
    stroke: black,
  },
});

export const Contact: FunctionComponent = () => {
  const [t] = useTranslation();
  return (
    <Section
      heading={t('contact.heading')}
      id="contact"
      colorScheme={ColorScheme.Cyan}
    >
      <Address>
        <LinkList>
          <BigLink
            href="https://www.openstreetmap.org/search?query=munich%20germany#map=11/48.1551/11.5418"
            title="Map"
          >
            <MapPin />
            <p>{t('contact.city')}</p>
          </BigLink>
          <BigLink href="https://threema.id/9TWBW4XN" title="Threema">
            <MessageSquare />
            <p>Threema</p>
          </BigLink>
        </LinkList>
        <Form onSubmit={sendForm} />
        <SmallLinkList>
          <SmallLink href="https://twitter.com/CallistoShip" title="Twitter">
            <Twitter />
          </SmallLink>
          <SmallLink href="https://github.com/screendriver" title="GitHub">
            <GitHub color={white} />
          </SmallLink>
          <SmallLink
            href="https://www.linkedin.com/in/unicornyuppie"
            title="LinkedIn"
          >
            <Linkedin color={white} />
          </SmallLink>
        </SmallLinkList>
      </Address>
    </Section>
  );
};
