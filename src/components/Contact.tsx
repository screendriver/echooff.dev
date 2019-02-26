import React from 'react';
import {
  MapPin,
  MessageSquare,
  Twitter,
  GitHub,
  Linkedin,
} from 'react-feather';
import styled from '@emotion/styled';
import { Section, SectionTheme } from './Section';
import { black, white } from '../colors';
import { ContactForm } from './ContactForm';

const LinkList = styled.div({
  display: 'flex',
  justifyContent: 'center',
  a: {
    color: black,
    textDecoration: 'none',
  },
});

const SmallLinkList = styled(LinkList)({
  marginTop: 50,
});

const BigLink = styled.a({
  marginLeft: 50,
  marginRight: 50,
});

const SmallLink = styled.a({
  marginLeft: 20,
  marginRight: 20,
  svg: {
    stroke: white,
    transition: 'stroke 0.3s',
  },
  'svg:hover': {
    stroke: black,
  },
});

export function Contact() {
  return (
    <Section heading="Contact" theme={SectionTheme.Cyan}>
      <LinkList>
        <BigLink href="https://www.openstreetmap.org/search?query=munich%20germany#map=11/48.1551/11.5418">
          <MapPin />
          <p>Munich, Germany</p>
        </BigLink>
        <BigLink href="threema://add?id=9TWBW4XN">
          <MessageSquare />
          <p>Threema ID: 9TWBW4XN</p>
        </BigLink>
      </LinkList>
      <ContactForm />
      <SmallLinkList>
        <SmallLink href="https://twitter.com/CallistoShip">
          <Twitter />
        </SmallLink>
        <SmallLink href="https://github.com/screendriver">
          <GitHub color={white} />
        </SmallLink>
        <SmallLink href="https://www.linkedin.com/in/christian-rackerseder-81a906177/">
          <Linkedin color={white} />
        </SmallLink>
      </SmallLinkList>
    </Section>
  );
}
