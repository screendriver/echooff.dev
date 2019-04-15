import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import { SEOPure } from './SEOPure';

interface QueryResult {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
      keywords: string;
      favicon: string;
    };
  };
}

interface SEOProps {
  title?: string;
}

export function SEO(props: SEOProps) {
  return (
    <StaticQuery
      query={query}
      // tslint:disable-next-line jsx-no-lambda
      render={({ site: { siteMetadata } }: QueryResult) => {
        const { title = siteMetadata.title } = props;
        return <SEOPure {...siteMetadata} title={title} />;
      }}
    />
  );
}

const query = graphql`
  query SEO {
    site {
      siteMetadata {
        title
        description
        author
        keywords
        favicon
      }
    }
  }
`;
