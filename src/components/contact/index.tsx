import React, { useState, Dispatch, SetStateAction } from 'react';
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
import { ContactForm } from './form';
import { ContactFormSent } from './formSent';

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

function handleFormSent(setFormSent: Dispatch<SetStateAction<boolean>>) {
  return () => setFormSent(true);
}

export function Contact() {
  const [formSent, setFormSent] = useState(false);
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
        {formSent ? (
          <ContactFormSent />
        ) : (
          <ContactForm onFormSent={handleFormSent(setFormSent)} />
        )}
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
      </Address>
    </Section>
  );
}
