import React from 'react';
import styled from '@emotion/styled';
import { Section, SectionTheme } from '../Section';
import { Circle } from './Circle';
import { Description } from './Description';
import { Experience } from '.';

interface ExperiencesProps {
  experiences: ReadonlyArray<Experience>;
}

const Timeline = styled.ul({
  listStyleType: 'none',
  position: 'relative',
  padding: 0,
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#eee',
  },
});

const Moment = styled.li({
  position: 'relative',
  marginBottom: 100,
});

export function Experiences(props: ExperiencesProps) {
  return (
    <Section heading="Experience" theme={SectionTheme.Light}>
      <Timeline>
        {props.experiences.map(experience => (
          <Moment>
            <Description experience={experience} />
            <Circle from={experience.from} to={experience.to} />
          </Moment>
        ))}
      </Timeline>
    </Section>
  );
}
