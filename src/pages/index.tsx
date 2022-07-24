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
import { Resume } from '../resume/Resume';
import { Contact } from '../contact/Contact';
import { createContactStateMachine } from '../contact/state-machine';
import { createErrorReporter } from '../error-reporter/reporter';
import { parseMainPageData } from '../main-page-schema';

export const query = graphql`
    query MainPage {
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
        headerImage: file(relativePath: { eq: "img/header-01.jpg" }) {
            childImageSharp {
                gatsbyImageData(layout: FULL_WIDTH, quality: 70, transformOptions: { grayscale: true })
            }
        }
    }
`;

const IndexPage: FunctionComponent<PageProps> = ({ data }) => {
    const mainPageDataResult = parseMainPageData(data);

    if (mainPageDataResult.isErr) {
        throw new Error(mainPageDataResult.error);
    }

    const mainPageData = mainPageDataResult.value;
    const { author, jobTitle, keywords, favicon } = mainPageData.site.siteMetadata;
    const currentTimestamp = process.env.NODE_ENV === 'production' ? new Date() : new Date(2022, 2, 23);
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
            <Header headerImage={mainPageData.headerImage} />
            <main className="text-dracula-light">
                <About />
                <Skills />
                <Passions />
                <Statistics statisticsStateMachine={gitHubStateMachine} />
                <Resume resume={mainPageData.allResumeDataJson.nodes} />
                <Contact contactStateMachine={contactStateMachine} />
            </main>
        </Fragment>
    );
};

export default IndexPage;
