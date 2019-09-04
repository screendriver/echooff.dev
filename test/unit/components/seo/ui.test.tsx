import test from 'ava';
import React from 'react';
import { render } from '@testing-library/react';
import Helmet from 'react-helmet';
import { SeoUi, SeoUiProps } from '../../../../src/components/seo/ui';

const props: SeoUiProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

test('renders a title', t => {
  render(<SeoUi {...props} />);
  const { title } = Helmet.peek();
  t.is(title as unknown, 'test title');
});

test('renders lang "en" HTML attribute', t => {
  render(<SeoUi {...props} />);
  const { htmlAttributes } = Helmet.peek();
  t.deepEqual(htmlAttributes as unknown, { lang: 'en' });
});

test('renders a favicon', t => {
  render(<SeoUi {...props} />);
  const { linkTags } = Helmet.peek() as any;
  t.deepEqual(linkTags, [{ rel: 'shortcut icon', href: 'icon.png' }]);
});

test('renders meta tags', t => {
  render(<SeoUi {...props} />);
  const { metaTags } = Helmet.peek() as any;
  t.deepEqual(metaTags, [
    { name: 'theme-color', content: '#7bc3d1' },
    { name: 'description', content: 'my description' },
    { name: 'keywords', content: 'key,words' },
    { name: 'author', content: 'me' },
  ]);
});
