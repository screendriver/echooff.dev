import React, { FunctionComponent } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { useTranslation } from 'react-i18next';
import { SeoUi } from './ui';

interface QueryResult {
  site: {
    siteMetadata: {
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
        keywords
        favicon
      }
    }
  }
`;

export const SEO: FunctionComponent<SEOProps> = (props) => {
  const [t] = useTranslation();
  const title: string = props.title ?? t('meta.title');
  const description = t('meta.job-title');
  const author = t('meta.name');
  const {
    site: { siteMetadata },
  } = useStaticQuery<QueryResult>(query);
  return (
    <SeoUi
      title={title}
      favicon={siteMetadata.favicon}
      description={description}
      keywords={siteMetadata.keywords}
      author={author}
    />
  );
};
