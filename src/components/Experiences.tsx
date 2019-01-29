import React from 'react';
import { Section, SectionTheme } from './Section';

export interface Experience {
  from: string;
  to: string;
  heading: string;
  subheading: string;
  description: string;
}

interface ExperiencesProps {
  experiences: ReadonlyArray<Experience>;
}

export function Experiences(props: ExperiencesProps) {
  return (
    <Section heading="Experience" theme={SectionTheme.White}>
      <div>
        {props.experiences.map(experience => (
          <p>{experience.description}</p>
        ))}
      </div>
    </Section>
  );
}
