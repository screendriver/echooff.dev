import React, { Fragment, FunctionComponent } from 'react';
import { graphql, PageProps } from 'gatsby';
import ky from 'ky';
import { Head } from '../Head';
import { Header } from '../Header';
import { Statistics } from '../statistics/Statistics';
import { createStatisticsStateMachine } from '../statistics/state-machine';
import { About } from '../about/About';

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
    const currentTimestamp = new Date();
    const gitHubStateMachine = createStatisticsStateMachine({ ky, currentTimestamp });
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
            <main className="text-dracula-light">
                <About />
                <Statistics statisticsStateMachine={gitHubStateMachine} />
            </main>
        </Fragment>
    );
};

export default V2Page;
