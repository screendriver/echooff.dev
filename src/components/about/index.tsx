import React, { FunctionComponent } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { IGatsbyImageData } from 'gatsby-plugin-image';
import { AboutUi } from './ui';

interface GraphQLData {
  aboutFile: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
  };
}

const query = graphql`
  query {
    aboutFile: file(name: { eq: "about" }, extension: { eq: "jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: CONSTRAINED, quality: 75, width: 200)
      }
    }
  }
`;

export const About: FunctionComponent = () => {
  const data = useStaticQuery<GraphQLData>(query);
  return <AboutUi imageData={data.aboutFile.childImageSharp.gatsbyImageData} />;
};
