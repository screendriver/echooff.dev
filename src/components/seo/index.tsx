import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { SeoUi } from './ui';

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

export function SEO(props: SEOProps) {
  const {
    site: { siteMetadata },
  } = useStaticQuery<QueryResult>(query);
  const { title = siteMetadata.title } = props;
  return <SeoUi {...siteMetadata} title={title} />;
}
