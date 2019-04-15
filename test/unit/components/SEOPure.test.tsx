import React from 'react';
import { render } from 'react-testing-library';
import Helmet from 'react-helmet';
import { SEOPure, SEOPureProps } from '../../../src/components/SEOPure';

const props: SEOPureProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

test('renders a title', async () => {
  render(<SEOPure {...props} />);
  const { title } = Helmet.peek();
  expect(title).toEqual('test title');
});

test('renders lang "en" HTML attribute', () => {
  render(<SEOPure {...props} />);
  const { htmlAttributes } = Helmet.peek();
  expect(htmlAttributes).toEqual({ lang: 'en' });
});

test('renders a favicon', () => {
  render(<SEOPure {...props} />);
  const { linkTags } = Helmet.peek() as any;
  expect(linkTags).toEqual([{ rel: 'shortcut icon', href: 'icon.png' }]);
});

test('renders meta tags', () => {
  render(<SEOPure {...props} />);
  const { metaTags } = Helmet.peek() as any;
  expect(metaTags).toEqual([
    { name: 'theme-color', content: '#7bc3d1' },
    { name: 'description', content: 'my description' },
    { name: 'keywords', content: 'key,words' },
    { name: 'author', content: 'me' },
  ]);
});
