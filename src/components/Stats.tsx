import React from 'react';
import styled from '@emotion/styled';
import { Section, SectionTheme } from './Section';

interface StatsProps {
  linesOfCode: number;
  gitHubRepos: number;
  gitHubStars: number;
  yearsOfExperience: number;
}

interface StatPrpops {
  counter: number;
  text: string;
}

const StatList = styled.div({
  display: 'flex',
  justifyContent: 'space-around',
});

function Stat(props: StatPrpops) {
  return (
    <div>
      <span>{props.counter}</span>
      <h4>{props.text}</h4>
    </div>
  );
}

export function Stats(props: StatsProps) {
  return (
    <Section heading="Some Stats" theme={SectionTheme.Cyan}>
      <StatList>
        <Stat counter={props.linesOfCode} text="Lines of Code" />
        <Stat counter={props.gitHubRepos} text="GitHub Repos" />
        <Stat counter={props.gitHubStars} text="GitHub Stars" />
        <Stat counter={props.yearsOfExperience} text="Years of Experience" />
      </StatList>
    </Section>
  );
}
