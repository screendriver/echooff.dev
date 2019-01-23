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
  padding: '100px 0',
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
  marginBottom: 40,
});

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
    <SkillsStyled>
      <Title>Skills</Title>
      <HorizontalLine />
      <SkillsList>
        {props.skills.map(skill => (
          <ProgressWrapper>
            <ProgressStyled percent={skill.percent} description={skill.name} />
          </ProgressWrapper>
        ))}
      </SkillsList>
    </SkillsStyled>
  );
}
