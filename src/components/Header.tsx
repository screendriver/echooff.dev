import React, { FunctionComponent } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import sample from 'lodash.sample';
import styled from '@emotion/styled';
import { Trans, useTranslation } from 'react-i18next';
import { white, black } from '../colors';
import { Config } from '../shared/config';

interface Edge {
  node: { childImageSharp: { gatsbyImageData: IGatsbyImageData } };
}

interface GraphQLData {
  headerAllFile: {
    edges: Edge[];
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

const GatsbyImageStyled = styled(GatsbyImage)({
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

function assertIsEdge(edge?: Edge): asserts edge is Edge {
  if (edge === undefined) {
    throw new Error('Expected edge to be defined');
  }
}

function getHeaderImage(
  randomHeaderImage: boolean,
  edges: GraphQLData['headerAllFile']['edges'],
): IGatsbyImageData {
  const edge = randomHeaderImage ? sample(edges) : edges[0];
  assertIsEdge(edge);
  return edge.node.childImageSharp.gatsbyImageData;
}

const HeaderComponent: FunctionComponent<HeaderComponentProps> = ({
  randomHeaderImage,
  data,
}) => {
  const [t] = useTranslation();
  const edges = data.headerAllFile.edges;
  const imageData = getHeaderImage(randomHeaderImage, edges);
  return (
    <HeaderStyled id="header">
      <GatsbyImageStyled alt="Header image" image={imageData} />
      <Intro>
        <Hello>
          <Trans i18nKey="header.hello">
            Hello, I&apos;m <Name>Christian</Name>
          </Trans>
        </Hello>
        <JobTitle>{t('header.job-title')}</JobTitle>
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
            gatsbyImageData(
              layout: FULL_WIDTH
              quality: 80
              placeholder: BLURRED
            )
          }
        }
      }
    }
  }
`;

interface HeaderProps {
  config: Config;
}

export const Header: FunctionComponent<HeaderProps> = (props) => {
  const data = useStaticQuery<GraphQLData>(query);
  return (
    <HeaderComponent
      randomHeaderImage={!props.config.visualRegressionTest}
      data={data}
    />
  );
};
