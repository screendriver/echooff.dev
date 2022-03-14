import React, { Fragment, FunctionComponent } from 'react';
import { graphql, PageProps } from 'gatsby';
import ky from 'ky';
import * as Sentry from '@sentry/gatsby';
import { Head } from '../Head';
import { Header } from '../Header';
import { About } from '../about/About';
import { Skills } from '../skills/Skills';
import { createStatisticsStateMachine } from '../statistics/state-machine';
import { Statistics } from '../statistics/Statistics';
import { Passions } from '../passions/Passions';
import { Resume, ResumeData } from '../resume/Resume';
import { Contact } from '../contact/Contact';
import { createContactStateMachine } from '../contact/state-machine';
import { createErrorReporter } from '../error-reporter/reporter';

interface DataType {
    readonly site: {
        readonly siteMetadata: {
            readonly author: string;
            readonly jobTitle: string;
            readonly keywords: string;
            readonly favicon: string;
        };
    };
    readonly allResumeDataJson: {
        readonly nodes: readonly ResumeData[];
    };
}

type IndexPageProps = PageProps<DataType>;

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
        allResumeDataJson(sort: { fields: since, order: DESC }) {
            nodes {
                since
                showOnlyYear
                industry
                jobTitle
                jobDescription
            }
        }
    }
`;

const IndexPage: FunctionComponent<IndexPageProps> = ({ data }) => {
    const { author, jobTitle, keywords, favicon } = data.site.siteMetadata;
    const currentTimestamp = new Date();
    const errorReporter = createErrorReporter({ sentry: Sentry });
    const gitHubStateMachine = createStatisticsStateMachine({ ky, currentTimestamp, errorReporter });
    const contactFormActionUrl = process.env.GATSBY_CONTACT_FORM_URL ?? '';
    const contactStateMachine = createContactStateMachine({ ky, formActionUrl: contactFormActionUrl, errorReporter });

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
                <Skills />
                <Passions />
                <Statistics statisticsStateMachine={gitHubStateMachine} />
                <Resume resume={data.allResumeDataJson.nodes} />
                <Contact contactStateMachine={contactStateMachine} />
            </main>
        </Fragment>
    );
};

export default IndexPage;
