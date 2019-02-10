import React, { useState, FC } from 'react';
import { graphql, StaticQuery } from 'gatsby';
import useSetInterval from 'use-set-interval';
import Img, { FluidObject } from 'gatsby-image';
import sample from 'lodash.sample';
import styled from '@emotion/styled';
import { white } from '../colors';
import { LinkButton } from './LinkButton';

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
  '@media (max-width: 768px)': {
    textAlign: 'center',
  },
});

const ImgStyled = styled(Img)({
  height: 720,
  '@media (max-width: 768px)': {
    height: 380,
  },
});

const Intro = styled.div({
  position: 'absolute',
  top: '39%',
  marginLeft: '8%',
  '@media (max-width: 768px)': {
    top: '13%',
    marginLeft: 0,
  },
});

const Hello = styled.h1({
  fontSize: 60,
  fontWeight: 500,
  letterSpacing: -2,
  marginBottom: 25,
  '@media (max-width: 768px)': {
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 10,
  },
});

const JobTitle = styled.h2({
  fontSize: 20,
  fontFamily: 'Lato, sans-serif',
  fontWeight: 'lighter',
  marginBottom: 40,
  '@media (max-width: 768px)': {
    fontSize: 14,
    marginBottom: 20,
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
        <LinkButton href="#about">Learn more</LinkButton>
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
  return (
    <StaticQuery
      query={query}
      render={(data: GraphQLData) => <HeaderComponent data={data} />}
    />
  );
}
