import 'modern-normalize';
import React from 'react';
import { Global } from '@emotion/core';
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
      <Header />
      <Navigation />
      <About />
      <Skills />
      <Passions />
      <Stats />
      <Experiences />
      <Contact />
      <Footer />
    </>
  );
}
