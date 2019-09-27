import React from 'react';
import { Helmet } from 'react-helmet';
import { cyan } from '../../colors';

export interface SeoUiProps {
  title: string;
  description: string;
  author: string;
  keywords: string;
  favicon: string;
}

export function SeoUi({
  title,
  description,
  author,
  keywords,
  favicon,
}: SeoUiProps) {
  return (
    <Helmet title={title}>
      <html lang="en" />
      <link rel="shortcut icon" href={favicon} />
      <meta name="theme-color" content={cyan} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
    </Helmet>
  );
}
