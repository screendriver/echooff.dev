import 'modern-normalize';
import 'typeface-open-sans';
import 'typeface-lato';
import React from 'react';
import { Global } from '@emotion/core';
import { createConfig } from '../shared/config';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/about';
import { Skills } from '../components/skills';
import { Passions } from '../components/Passions';
import { Stats } from '../components/Stats';
import { Experiences } from '../components/experiences';
import { SEO } from '../components/seo';
import { Contact } from '../components/contact';
import { Footer } from '../components/Footer';

const config = createConfig();

export default function Page() {
  return (
    <>
      <Global
        styles={{
          body: {
            fontFamily: 'Open Sans, sans-serif',
            WebkitFontSmoothing: 'antialiased',
          },
        }}
      />
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
      <Footer config={config} />
    </>
  );
}
