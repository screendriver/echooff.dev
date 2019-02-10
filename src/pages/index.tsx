import 'modern-normalize';
import React, { FC } from 'react';
import { graphql } from 'gatsby';
import { Global } from '@emotion/core';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/About';
import { Skills } from '../components/Skills';
import { Portfolio } from '../components/Portfolio';
import { Stats } from '../components/Stats';
import { Experiences } from '../components/experiences';
import { SEO } from '../components/SEO';

interface PageProps {
  data: {
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
  };
}

const Page: FC<PageProps> = ({ data }) => {
  const gitHubUser = data.github.user;
  return (
    <>
      <Global
        styles={{
          body: {
            fontFamily: 'Open Sans, sans-serif',
          },
        }}
      />
      <SEO />
      <GitHubCorner />
      <Header />
      <Navigation />
      <About />
      <Skills />
      <Portfolio />
      <Stats
        linesOfCode={999999}
        gitHubRepos={gitHubUser.repositories.totalCount}
        gitHubStars={gitHubUser.starredRepositories.totalCount}
        yearsOfExperience={new Date().getFullYear() - 2001}
      />
      <Experiences />
    </>
  );
};

export default Page;

export const query = graphql`
  {
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
