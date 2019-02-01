import 'modern-normalize';
import React from 'react';
import { graphql } from 'gatsby';
import { FixedObject, FluidObject } from 'gatsby-image';
import { Global } from '@emotion/core';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/About';
import { Skills, Skill } from '../components/Skills';
import { Portfolio } from '../components/Portfolio';
import { Stats } from '../components/Stats';
import { Experiences, Experience } from '../components/experiences';
import { SEO } from '../components/SEO';

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
    allExperienceJson: {
      edges: [{ node: Experience }];
    };
  };
}

export default ({ data }: Props) => {
  const gitHubUser = data.github.user;
  return (
    <>
      <Global
        styles={{
          fontFamily: 'Open Sans, sans-serif',
        }}
      />
      <SEO />
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
      <Portfolio />
      <Stats
        linesOfCode={999999}
        gitHubRepos={gitHubUser.repositories.totalCount}
        gitHubStars={gitHubUser.starredRepositories.totalCount}
        yearsOfExperience={new Date().getFullYear() - 2001}
      />
      <Experiences
        experiences={data.allExperienceJson.edges.map<Experience>(
          ({ node }) => ({
            from: node.from,
            to: node.to,
            heading: node.heading,
            subheading: node.subheading,
            description: node.description,
          }),
        )}
      />
    </>
  );
};

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
    allExperienceJson {
      edges {
        node {
          from
          to
          heading
          subheading
          description
        }
      }
    }
  }
`;
