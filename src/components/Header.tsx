import React, { useState, FC } from 'react';
import { graphql, StaticQuery } from 'gatsby';
import useSetInterval from 'use-set-interval';
import Img, { FluidObject } from 'gatsby-image';
import sample from 'lodash.sample';
import styled from '@emotion/styled';
import { white, black } from '../colors';
import { Config } from '../shared/config';
import { LoadingIndicator } from './LoadingIndicator';

interface GraphQLData {
  headerAllFile: {
    edges: [{ node: { childImageSharp: { fluid: FluidObject } } }];
  };
  site: {
    siteMetadata: {
      description: string;
    };
  };
}

interface HeaderComponentProps {
  data: GraphQLData;
  randomHeaderImage: boolean;
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
  textShadow: `5px 5px 10px ${black}`,
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

const timeToImageChange = 20000;

function getHeaderImage(
  randomHeaderImage: boolean,
  edges: GraphQLData['headerAllFile']['edges'],
): FluidObject {
  const edge = randomHeaderImage ? sample(edges) : edges[0];
  return edge!.node.childImageSharp.fluid;
}

const HeaderComponent: FC<HeaderComponentProps> = ({
  randomHeaderImage,
  data,
}) => {
  const edges = data.headerAllFile.edges;
  const [fluid, setFluid] = useState(getHeaderImage(randomHeaderImage, edges));
  const [imgLoaded, setImgLoaded] = useState(false);
  useSetInterval(() => {
    setImgLoaded(false);
    setFluid(getHeaderImage(randomHeaderImage, edges));
  }, timeToImageChange);
  return (
    <HeaderStyled id="header">
      <LoadingIndicator start={imgLoaded} runTime={timeToImageChange} />
      <ImgStyled fluid={fluid} onLoad={() => setImgLoaded(true)} />
      <Intro>
        <Hello>
          Hello, I'm <Name>Christian</Name>
        </Hello>
        <JobTitle>{data.site.siteMetadata.description}</JobTitle>
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
    site {
      siteMetadata {
        description
      }
    }
  }
`;

interface HeaderProps {
  config: Config;
}

export function Header(props: HeaderProps) {
  function render(data: GraphQLData) {
    return (
      <HeaderComponent
        randomHeaderImage={!props.config.visualRegressionTest}
        data={data}
      />
    );
  }
  return <StaticQuery query={query} render={render} />;
}
