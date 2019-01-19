import 'modern-normalize';
import React from 'react';
import { css } from '@emotion/core';
import { Head } from '../components/Head';
import { GitHubCorner } from '../components/GitHubCorner';

const styles = css({
  color: 'blue',
});

export default () => (
  <>
    <Head />
    <GitHubCorner />
    <div css={styles}>Hello World!</div>
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
