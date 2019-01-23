import 'modern-normalize';
import React from 'react';
import { graphql } from 'gatsby';
import { FixedObject, FluidObject } from 'gatsby-image';
import { Global } from '@emotion/core';
import { Head } from '../components/Head';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/About';
import { Skills, Skill } from '../components/Skills';

interface Props {
  data: {
    headerAllFile: {
      edges: [{ node: { childImageSharp: { fluid: FluidObject } } }];
    };
    aboutFile: {
      childImageSharp: {
        fixed: FixedObject;
      };
    };
    allSkillsJson: {
      edges: [{ node: Skill }];
    };
  };
}

export default ({ data }: Props) => (
  <>
    <Global
      styles={{
        fontFamily: 'Open Sans, sans-serif',
      }}
    />
    <Head />
    <GitHubCorner />
    <Header edges={data.headerAllFile.edges} />
    <Navigation />
    <About image={data.aboutFile.childImageSharp.fixed} />
    <Skills
      skills={data.allSkillsJson.edges.map<Skill>(({ node }) => ({
        name: node.name,
        percent: node.percent,
      }))}
    />
  </>
);

export const query = graphql`
  {
    headerAllFile: allFile(
      filter: { relativePath: { glob: "img/intro-bg*.jpg" } }
      sort: { fields: [name] }
    ) {
      edges {
        node {
          childImageSharp {
            fluid(quality: 80) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    }
    aboutFile: file(name: { eq: "about" }, extension: { eq: "jpg" }) {
      childImageSharp {
        fixed(quality: 75, width: 200) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
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
