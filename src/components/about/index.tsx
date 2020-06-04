import React, { FunctionComponent } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { FixedObject } from 'gatsby-image';
import { AboutUi } from './ui';

interface GraphQLData {
  aboutFile: {
    childImageSharp: {
      fixed: FixedObject;
    };
  };
}

const query = graphql`
  query {
    aboutFile: file(name: { eq: "about" }, extension: { eq: "jpg" }) {
      childImageSharp {
        fixed(quality: 75, width: 200) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
  }
`;

export const About: FunctionComponent = () => {
  const data = useStaticQuery<GraphQLData>(query);
  return <AboutUi fixedImage={data.aboutFile.childImageSharp.fixed} />;
};
