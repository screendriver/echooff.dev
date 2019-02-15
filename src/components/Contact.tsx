import React from 'react';
import { MapPin, Twitter, GitHub, Linkedin } from 'react-feather';
import { Section, SectionTheme } from './Section';

export function Contact() {
  return (
    <Section heading="Contact" theme={SectionTheme.Cyan}>
      <p>Contact</p>
      <a href="https://www.openstreetmap.org/search?query=munich%20germany#map=11/48.1551/11.5418">
        <MapPin />
      </a>
      <a href="https://twitter.com/CallistoShip">
        <Twitter />
      </a>
      <a href="https://github.com/screendriver">
        <GitHub />
      </a>
      <a href="https://www.linkedin.com/in/christian-rackerseder-81a906177/">
        <Linkedin />
      </a>
    </Section>
  );
}
