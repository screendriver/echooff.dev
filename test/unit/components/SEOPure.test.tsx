import test from 'tape';
import React from 'react';
import { render } from 'react-testing-library';
import Helmet from 'react-helmet';
import { withCleanup } from '../../cleanup';
import { SEOPure, SEOPureProps } from '../../../src/components/SEOPure';

const props: SEOPureProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

test(
  'renders a title',
  withCleanup(async t => {
    t.plan(1);
    render(<SEOPure {...props} />);
    const { title } = Helmet.peek();
    t.equal(title, 'test title');
  }),
);

test(
  'renders lang "en" HTML attribute',
  withCleanup(t => {
    t.plan(1);
    render(<SEOPure {...props} />);
    const { htmlAttributes } = Helmet.peek();
    t.deepEqual(htmlAttributes, { lang: 'en' });
  }),
);

test(
  'renders a favicon',
  withCleanup(t => {
    t.plan(1);
    render(<SEOPure {...props} />);
    const { linkTags } = Helmet.peek() as any;
    t.deepEqual(linkTags, [{ rel: 'shortcut icon', href: 'icon.png' }]);
  }),
);

test(
  'renders meta tags',
  withCleanup(t => {
    t.plan(1);
    render(<SEOPure {...props} />);
    const { metaTags } = Helmet.peek() as any;
    t.deepEqual(metaTags, [
      { name: 'theme-color', content: '#7bc3d1' },
      { name: 'description', content: 'my description' },
      { name: 'keywords', content: 'key,words' },
      { name: 'author', content: 'me' },
    ]);
  }),
);
