import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import styled from '@emotion/styled';
import { white, black } from '../colors';
import { Section, SectionTheme } from './Section';

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
  data: GraphQLData;
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

function StatsComponent({ data }: StatsComponentProps) {
  const { repositories, starredRepositories } = data.github.user;
  return (
    <Section heading="Some Stats" theme={SectionTheme.Cyan}>
      <StatList>
        <Stat counter={999999} text="Lines of Code" />
        <Stat counter={repositories.totalCount} text="GitHub Repos" />
        <Stat counter={starredRepositories.totalCount} text="GitHub Stars" />
        <Stat
          counter={new Date().getFullYear() - 2001}
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

export function Stats() {
  return (
    <StaticQuery
      query={query}
      render={(data: GraphQLData) => <StatsComponent data={data} />}
    />
  );
}
