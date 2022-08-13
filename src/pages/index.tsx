import React, { Fragment, FunctionComponent } from 'react';
import { graphql, HeadFC, HeadProps, PageProps } from 'gatsby';
import ky from 'ky';
import * as Sentry from '@sentry/gatsby';
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
    fragment HeaderImage on File {
        childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, quality: 70, transformOptions: { grayscale: true })
        }
    }

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
            ...HeaderImage
        }
        headerImageSmall: file(relativePath: { eq: "img/header-01-small.jpg" }) {
            ...HeaderImage
        }
    }
`;

export const Head: HeadFC<HeadProps> = ({ data }) => {
    const mainPageDataResult = parseMainPageData(data);

    if (mainPageDataResult.isErr) {
        throw new Error(mainPageDataResult.error);
    }

    const { author, jobTitle, keywords, favicon } = mainPageDataResult.value.site.siteMetadata;

    return (
        <Fragment>
            <title>{`${author} - ${jobTitle}`}</title>
            <link rel="shortcut icon" href={favicon} />
            <meta name="theme-color" content="#bd93f9" />
            <meta name="description" content={jobTitle} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
        </Fragment>
    );
};

const IndexPage: FunctionComponent<PageProps> = ({ data }) => {
    const mainPageDataResult = parseMainPageData(data);

    if (mainPageDataResult.isErr) {
        throw new Error(mainPageDataResult.error);
    }

    const mainPageData = mainPageDataResult.value;
    const currentTimestamp = process.env.NODE_ENV === 'production' ? new Date() : new Date(2022, 2, 23);
    const errorReporter = createErrorReporter({ sentry: Sentry });
    const gitHubStateMachine = createStatisticsStateMachine({ ky, currentTimestamp, errorReporter });
    const contactFormActionUrl = process.env.GATSBY_CONTACT_FORM_URL ?? '';
    const contactStateMachine = createContactStateMachine({ ky, formActionUrl: contactFormActionUrl, errorReporter });

    return (
        <Fragment>
            <Header headerImage={mainPageData.headerImage} headerImageSmall={mainPageData.headerImageSmall} />
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
