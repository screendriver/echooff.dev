import React from 'react';
import { Section, SectionTheme } from './Section';

export interface Experience {
  from: string;
  to: string;
  heading: string;
  subheading: string;
  description: string;
}

export function Experiences() {
  return (
    <Section heading="Some Stats" theme={SectionTheme.White}>
      <div>bla</div>
    </Section>
  );
}
