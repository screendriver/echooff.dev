import React, { CSSProperties } from 'react';
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
  width: '100%',
  margin: 0,
  padding: 0,
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 40,
    width: 2,
    backgroundColor: '#eee',
    '@media (min-width: 768px)': {
      left: '50%',
    },
  },
});

const CircleStyled = styled(Circle)({
  marginRight: 20,
  '@media (min-width: 768px)': {
    marginLeft: 20,
  },
});

const DescriptionStyled = styled(Description)<{ position: 'left' | 'right' }>(
  {
    width: '65%',
    '@media (min-width: 375px)': {
      width: '70%',
    },
    '@media (min-width: 768px)': {
      width: 'calc(50% - 70px)',
    },
    '@media (min-width: 1024px)': {
      width: 'calc(50% - 95px)',
    },
  },
  props => {
    return {
      '@media (min-width: 768px)': {
        order: props.position === 'left' ? -1 : 1,
        textAlign: props.position === 'left' ? 'right' : 'left',
      },
    };
  },
);

const Moment = styled.li<{ justifyContent: CSSProperties['justifyContent'] }>(
  {
    display: 'flex',
    marginBottom: 50,
    ':last-child': {
      marginBottom: 0,
    },
    '@media (min-width: 1024px)': {
      alignItems: 'center',
      marginBottom: 100,
    },
  },
  props => {
    return {
      '@media (min-width: 768px)': { justifyContent: props.justifyContent },
    };
  },
);

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
    <Section heading="Experience" id="experience" theme={SectionTheme.Light}>
      <Timeline>
        {experiences.map((experience, index) => (
          <Moment
            key={index}
            justifyContent={index % 2 ? 'flex-end' : 'flex-start'}
          >
            <CircleStyled experience={experience} />
            <DescriptionStyled
              experience={experience}
              position={index % 2 ? 'right' : 'left'}
            />
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
  function render(data: GraphQLData) {
    return <ExperiencesComponent data={data} />;
  }
  return <StaticQuery query={query} render={render} />;
}
