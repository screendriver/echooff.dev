import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import styled from '@emotion/styled';
import { Section, SectionTheme } from '../Section';
import { Circle } from './Circle';
import { Description } from './Description';
import { Experience } from '.';

interface GraphQLData {
  allExperienceJson: {
    edges: [{ node: Experience }];
  };
}

interface ExperiencesComponentProps {
  data: GraphQLData;
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

function ExperiencesComponent({ data }: ExperiencesComponentProps) {
  const experiences = data.allExperienceJson.edges.map<Experience>(
    ({ node }) => ({
      from: node.from,
      to: node.to,
      industry: node.industry,
      jobTitle: node.jobTitle,
      jobDescription: node.jobDescription,
    }),
  );
  return (
    <Section heading="Experience" theme={SectionTheme.Light}>
      <Timeline>
        {experiences.map((experience, index) => (
          <Moment key={index}>
            <Circle
              from={experience.from}
              to={experience.to}
              childPosition={index % 2 ? 'right' : 'left'}
            >
              <Description experience={experience} />
            </Circle>
          </Moment>
        ))}
      </Timeline>
    </Section>
  );
}

const query = graphql`
  query {
    allExperienceJson {
      edges {
        node {
          from
          to
          industry
          jobTitle
          jobDescription
        }
      }
    }
  }
`;

export function Experiences() {
  return (
    <StaticQuery
      query={query}
      render={(data: GraphQLData) => <ExperiencesComponent data={data} />}
    />
  );
}
