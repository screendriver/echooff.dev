import React from 'react';
import styled from '@emotion/styled';
import { Section, SectionTheme } from './Section';
import { Progress } from './Progress';

export interface Skill {
  name: string;
  percent: number;
}

interface SkillsProps {
  skills: ReadonlyArray<Skill>;
}

const SkillsList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  margin: '0 100px',
});

const ProgressWrapper = styled.div({
  width: '33%',
  marginTop: 40,
});

const ProgressStyled = styled(Progress)({
  margin: '0 auto',
});

export function Skills(props: SkillsProps) {
  return (
    <Section heading="Skills" theme={SectionTheme.Cyan}>
      <SkillsList>
        {props.skills.map(({ name, percent }) => (
          <ProgressWrapper key={name}>
            <ProgressStyled percent={percent} description={name} />
          </ProgressWrapper>
        ))}
      </SkillsList>
    </Section>
  );
}
