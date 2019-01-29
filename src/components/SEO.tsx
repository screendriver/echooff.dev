import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import Helmet from 'react-helmet';
import { cyan } from '../colors';

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

export function SEO() {
  return (
    <StaticQuery
      query={query}
      // tslint:disable-next-line jsx-no-lambda
      render={({ site: { siteMetadata } }: QueryResult) => {
        return (
          <Helmet title={siteMetadata.title}>
            <html lang="en" />
            <link rel="shortcut icon" href={siteMetadata.favicon} />
            <meta name="theme-color" content={cyan} />
            <meta name="description" content={siteMetadata.description} />
            <meta name="keywords" content={siteMetadata.keywords} />
            <meta name="author" content={siteMetadata.author} />
          </Helmet>
        );
      }}
    />
  );
}

export const query = graphql`
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
