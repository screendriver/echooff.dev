import 'modern-normalize';
import React from 'react';
import { graphql } from 'gatsby';
import { FluidObject } from 'gatsby-image';
import { Head } from '../components/Head';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';

interface Props {
  data: {
    allFile: {
      edges: [{ node: { childImageSharp: { fluid: FluidObject } } }];
    };
  };
}

export default ({ data }: Props) => (
  <>
    <Head />
    <GitHubCorner />
    <Header edges={data.allFile.edges} />
    <Navigation />
  </>
);

export const query = graphql`
  {
    allFile(
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
  }
`;
