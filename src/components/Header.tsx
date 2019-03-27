import React, { useState, FC } from 'react';
import { graphql, StaticQuery } from 'gatsby';
import useInterval from '@rooks/use-interval';
import Img, { FluidObject } from 'gatsby-image';
import sample from 'lodash.sample';
import styled from '@emotion/styled';
import { white, black } from '../colors';
import { Config } from '../shared/config';

interface Edge {
  node: { childImageSharp: { fluid: FluidObject } };
}

interface GraphQLData {
  headerAllFile: {
    edges: Edge[];
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

const timeToImageChange = 10000;

function randomEdge(
  edges: GraphQLData['headerAllFile']['edges'],
  previousHeaderImageSrc?: string,
): Edge {
  const edge = sample(edges) as Edge;
  return edge.node.childImageSharp.fluid.src === previousHeaderImageSrc
    ? randomEdge(edges, previousHeaderImageSrc)
    : edge;
}

function getHeaderImage(
  randomHeaderImage: boolean,
  edges: GraphQLData['headerAllFile']['edges'],
  previousHeaderImageSrc?: string,
): FluidObject {
  const edge = randomHeaderImage
    ? randomEdge(edges, previousHeaderImageSrc)
    : edges[0];
  return edge.node.childImageSharp.fluid;
}

const HeaderComponent: FC<HeaderComponentProps> = ({
  randomHeaderImage,
  data,
}) => {
  const edges = data.headerAllFile.edges;
  const [fluid, setFluid] = useState(getHeaderImage(randomHeaderImage, edges));
  const [imgLoaded, setImgLoaded] = useState(false);
  useInterval(
    () => {
      setImgLoaded(false);
      setFluid(getHeaderImage(randomHeaderImage, edges, fluid.src));
    },
    timeToImageChange,
    true,
  );
  return (
    <HeaderStyled id="header">
      <ImgStyled fluid={fluid} />
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
