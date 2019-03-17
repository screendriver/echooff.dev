import React, { useState, FC } from 'react';
import { graphql, StaticQuery } from 'gatsby';
import useSetInterval from 'use-set-interval';
import Img, { FluidObject } from 'gatsby-image';
import sample from 'lodash.sample';
import styled from '@emotion/styled';
import { white } from '../colors';

interface GraphQLData {
  headerAllFile: {
    edges: [{ node: { childImageSharp: { fluid: FluidObject } } }];
  };
}

interface HeaderComponentProps {
  data: GraphQLData;
}

const HeaderStyled = styled.header({
  color: white,
  position: 'relative',
});

const ImgStyled = styled(Img)({
  height: 380,
  '@media (min-width: 768px)': {
    height: 450,
  },
  '@media (min-width: 1024px)': {
    height: '100%',
  },
});

const Intro = styled.div({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  '@media (min-width: 320px)': {
    paddingLeft: 15,
    paddingRight: 15,
  },
  '@media (min-width: 768px)': {
    alignItems: 'flex-start',
  },
  '@media (min-width: 1024px)': {
    paddingLeft: '10%',
  },
});

const Hello = styled.h1({
  fontSize: 36,
  marginBottom: 0,
  textAlign: 'center',
  '@media (min-width: 768px)': {
    fontSize: 60,
  },
});

const JobTitle = styled.h2({
  fontSize: 18,
  fontFamily: 'Lato, sans-serif',
  fontWeight: 400,
  '@media (min-width: 768px)': {
    marginLeft: 4,
  },
});

const Name = styled.span({
  fontWeight: 600,
});

const HeaderComponent: FC<HeaderComponentProps> = ({ data }) => {
  const edges = data.headerAllFile.edges;
  function getRandomFluidImage(): FluidObject {
    const randomImage = sample(edges)!;
    return randomImage.node.childImageSharp.fluid;
  }
  const [fluid, setFluid] = useState(getRandomFluidImage());
  useSetInterval(() => setFluid(getRandomFluidImage()), 20000);
  return (
    <HeaderStyled id="header">
      <ImgStyled fluid={fluid} />
      <Intro>
        <Hello>
          Hello, I'm <Name>Christian</Name>
        </Hello>
        <JobTitle>Full Stack JavaScript Engineer</JobTitle>
      </Intro>
    </HeaderStyled>
  );
};

const query = graphql`
  query {
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
  }
`;

export function Header() {
  function render(data: GraphQLData) {
    return <HeaderComponent data={data} />;
  }
  return <StaticQuery query={query} render={render} />;
}
