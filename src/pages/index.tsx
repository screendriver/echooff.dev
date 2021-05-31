import 'modern-normalize';
import 'typeface-open-sans';
import 'typeface-lato';
import { graphql } from 'gatsby';
import { Fragment, FunctionComponent } from 'react';
import { Global } from '@emotion/react';
import { createConfig } from '../shared/config';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/About';
import { Skills } from '../components/skills';
import { Passions } from '../components/Passions';
import { Stats } from '../components/Stats';
import { Experiences } from '../components/experiences';
import { Quickmetrics } from '../components/Quickmetrics';
import { SEO } from '../components/seo';
import { Contact } from '../components/contact';
import { Footer } from '../components/Footer';

const config = createConfig();

export const query = graphql`
  query ($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`;

const Page: FunctionComponent = () => {
  return (
    <Fragment>
      <Global
        styles={{
          body: {
            fontFamily: 'Open Sans, sans-serif',
            WebkitFontSmoothing: 'antialiased',
          },
          a: {
            textDecoration: 'none',
          },
        }}
      />
      <Quickmetrics />
      <SEO />
      <GitHubCorner />
      <Header config={config} />
      <Navigation />
      <main>
        <About />
        <Skills />
        <Passions />
        <Stats config={config} />
        <Experiences />
        <Contact />
      </main>
      <Footer
        date={config.visualRegressionTest ? new Date(2019, 0) : new Date()}
      />
    </Fragment>
  );
};

export default Page;
