import 'modern-normalize';
import React from 'react';
import { Global } from '@emotion/core';
import { GitHubCorner } from '../components/GitHubCorner';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { About } from '../components/About';
import { Skills } from '../components/Skills';
import { Portfolio } from '../components/Portfolio';
import { Stats } from '../components/Stats';
import { Experiences } from '../components/experiences';
import { SEO } from '../components/SEO';

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
      <Portfolio />
      <Stats />
      <Experiences />
    </>
  );
}
