import React from 'react';
import {
  MapPin,
  MessageSquare,
  Twitter,
  GitHub,
  Linkedin,
} from 'react-feather';
import styled from '@emotion/styled';
import { Section, SectionTheme } from '../Section';
import { black, white } from '../../colors';
import { Form } from './form';

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

export function Contact() {
  return (
    <Section heading="Contact" id="contact" theme={SectionTheme.Cyan}>
      <Address>
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
        <Form />
        <SmallLinkList>
          <SmallLink href="https://twitter.com/CallistoShip">
            <Twitter />
          </SmallLink>
          <SmallLink href="https://github.com/screendriver">
            <GitHub color={white} />
          </SmallLink>
          <SmallLink href="https://www.linkedin.com/in/unicornyuppie">
            <Linkedin color={white} />
          </SmallLink>
        </SmallLinkList>
      </Address>
    </Section>
  );
}
