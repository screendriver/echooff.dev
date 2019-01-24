import React from 'react';
import styled from '@emotion/styled';
import { white, black } from '../colors';
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
  marginTop: 100,
  marginRight: '10%',
  marginLeft: '10%',
});

const Counter = styled.span({
  fontSize: 52,
  fontWeight: 600,
  color: black,
});

const Text = styled.h4({
  color: white,
  fontSize: 20,
  fontWeight: 400,
});

function Stat(props: StatPrpops) {
  return (
    <div>
      <Counter>{Number(props.counter).toLocaleString()}</Counter>
      <Text>{props.text}</Text>
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
