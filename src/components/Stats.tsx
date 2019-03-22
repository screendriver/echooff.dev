import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import styled from '@emotion/styled';
import { white, black } from '../colors';
import { Section, SectionTheme } from './Section';
import { Config } from '../shared/config';

interface GraphQLData {
  github: {
    user: {
      starredRepositories: {
        totalCount: number;
      };
      repositories: {
        totalCount: number;
      };
    };
  };
}

interface StatsComponentProps {
  staticNumbers: boolean;
  data: GraphQLData;
}

interface StatProps {
  counter: number;
  text: string;
}

const StatList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  width: '100%',
  '@media (min-width: 768px)': {
    flexDirection: 'row',
  },
  '@media (min-width: 1024px)': {
    width: '80%',
  },
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

function Stat(props: StatProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Counter>{Number(props.counter).toLocaleString()}</Counter>
      <Text>{props.text}</Text>
    </div>
  );
}

function StatsComponent({ data, staticNumbers }: StatsComponentProps) {
  const { repositories, starredRepositories } = data.github.user;
  return (
    <Section heading="Some Stats" id="stats" theme={SectionTheme.Cyan}>
      <StatList>
        <Stat counter={999999} text="Lines of Code" />
        <Stat
          counter={staticNumbers ? 58 : repositories.totalCount}
          text="GitHub Repos"
        />
        <Stat
          counter={staticNumbers ? 596 : starredRepositories.totalCount}
          text="GitHub Stars"
        />
        <Stat
          counter={staticNumbers ? 18 : new Date().getFullYear() - 2001}
          text="Years of Experience"
        />
      </StatList>
    </Section>
  );
}

const query = graphql`
  query {
    github {
      user(login: "screendriver") {
        starredRepositories {
          totalCount
        }
        repositories {
          totalCount
        }
      }
    }
  }
`;

interface StatsProps {
  config: Config;
}

export function Stats(props: StatsProps) {
  function render(data: GraphQLData) {
    return (
      <StatsComponent
        staticNumbers={props.config.visualRegressionTest}
        data={data}
      />
    );
  }
  return <StaticQuery query={query} render={render} />;
}
