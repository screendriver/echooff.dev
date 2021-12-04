import React, { Fragment, FunctionComponent } from 'react';
import { graphql, PageProps } from 'gatsby';
import ky from 'ky';
import { Head } from '../Head';
import { Header } from '../Header';
import { GitHubStatistics } from '../github/GitHubStatistics';
import { createGitHubStateMachine } from '../github/state-machine';

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
    const gitHubStateMachine = createGitHubStateMachine({ ky });
    return (
        <Fragment>
            <Head
                title={`${author} - ${jobTitle}`}
                description={jobTitle}
                author={author}
                keywords={keywords}
                favicon={favicon}
            />
            <Header />
            <GitHubStatistics gitHubStateMachine={gitHubStateMachine} />
        </Fragment>
    );
};

export default V2Page;
