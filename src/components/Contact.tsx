import React from 'react';
import { MapPin, Twitter } from 'react-feather';
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
    </Section>
  );
}
