import React from 'react';
import { Helmet } from 'react-helmet';
import { cyan } from '../colors';

export function Head() {
  return (
    <Helmet>
      <meta name="theme-color" content={cyan} />
      <link rel="shortcut icon" href="favicon.png" />
    </Helmet>
  );
}
