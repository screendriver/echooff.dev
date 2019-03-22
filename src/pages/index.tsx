import 'modern-normalize';
import 'typeface-open-sans';
import 'typeface-lato';
import React from 'react';
import { Global } from '@emotion/core';
import { createConfig } from '../shared/config';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/About';
import { Skills } from '../components/Skills';
import { Passions } from '../components/Passions';
import { Stats } from '../components/Stats';
import { Experiences } from '../components/experiences';
import { SEO } from '../components/SEO';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';

const config = createConfig();

export default function Page() {
  return (
    <>
      <Global
        styles={{
          body: {
            fontFamily: 'Open Sans, sans-serif',
          },
        }}
      />
      <SEO />
      <GitHubCorner />
      <Header config={config} />
      <Navigation />
      <About />
      <Skills />
      <Passions />
      <Stats config={config} />
      <Experiences />
      <Contact />
      <Footer config={config} />
    </>
  );
}
