import { Fragment, FunctionComponent } from 'react';
import { graphql, PageProps } from 'gatsby';
import { GlobalStyles } from 'twin.macro';
import { Header } from '../v2/Header';

interface DataType {
  readonly site: {
    readonly siteMetadata: {
      readonly author: string;
      readonly jobTitle: string;
      readonly keywords: string;
      readonly favicon: string;
    };
  };
}

type V2PageProps = PageProps<DataType>;

export const query = graphql`
  query V2 {
    site {
      siteMetadata {
        author
        jobTitle
        keywords
        favicon
      }
    }
  }
`;

const V2Page: FunctionComponent<V2PageProps> = ({ data }) => {
  const { author, jobTitle, keywords, favicon } = data.site.siteMetadata;
  return (
    <Fragment>
      <GlobalStyles />
      <Header
        title={`${author} - ${jobTitle}`}
        description={jobTitle}
        author={author}
        keywords={keywords}
        favicon={favicon}
      />
    </Fragment>
  );
};

export default V2Page;
