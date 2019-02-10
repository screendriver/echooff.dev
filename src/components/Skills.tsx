import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import styled from '@emotion/styled';
import { Section, SectionTheme } from './Section';
import { Progress } from './Progress';

export interface Skill {
  name: string;
  percent: number;
}

interface GraphQLData {
  allSkillsJson: {
    edges: [{ node: Skill }];
  };
}

interface SkillsComponentProps {
  data: GraphQLData;
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

function SkillsComponent({ data }: SkillsComponentProps) {
  const skills = data.allSkillsJson.edges.map<Skill>(({ node }) => ({
    name: node.name,
    percent: node.percent,
  }));
  return (
    <Section heading="Skills" theme={SectionTheme.Cyan}>
      <SkillsList>
        {skills.map(({ name, percent }) => (
          <ProgressWrapper key={name}>
            <ProgressStyled percent={percent} description={name} />
          </ProgressWrapper>
        ))}
      </SkillsList>
    </Section>
  );
}

const query = graphql`
  query {
    allSkillsJson {
      edges {
        node {
          name
          percent
        }
      }
    }
  }
`;

export function Skills() {
  function render(data: GraphQLData) {
    return <SkillsComponent data={data} />;
  }
  return <StaticQuery query={query} render={render} />;
}
