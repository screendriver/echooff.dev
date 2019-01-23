import React from 'react';
import styled from '@emotion/styled';
import { Progress } from './Progress';

export interface Skill {
  name: string;
  percent: number;
}

interface SkillsProps {
  skills: ReadonlyArray<Skill>;
}

const SkillsStyled = styled.div({
  backgroundColor: '#7bc3d1',
  textAlign: 'center',
});

const Title = styled.h1({
  fontWeight: 400,
  color: 'white',
});

const HorizontalLine = styled.hr({
  height: 4,
  width: 70,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  border: 0,
  marginBottom: 80,
});

export function Skills(props: SkillsProps) {
  return (
    <SkillsStyled>
      <Title>Skills</Title>
      <HorizontalLine />
      {props.skills.map(skill => (
        <Progress percent={skill.percent} description={skill.name} />
      ))}
    </SkillsStyled>
  );
}
