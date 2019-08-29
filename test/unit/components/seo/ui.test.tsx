import React from 'react';
import test from 'tape';
import { render } from '@testing-library/react';
import Helmet from 'react-helmet';
import { withCleanup } from '../../../cleanup';
import { SeoUi, SeoUiProps } from '../../../../src/components/seo/ui';

const props: SeoUiProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

test(
  'renders a title',
  withCleanup(t => {
    t.plan(1);
    render(<SeoUi {...props} />);
    const { title } = Helmet.peek();
    t.equal(title, 'test title');
  }),
);

test(
  'renders lang "en" HTML attribute',
  withCleanup(t => {
    t.plan(1);
    render(<SeoUi {...props} />);
    const { htmlAttributes } = Helmet.peek();
    t.deepEqual(htmlAttributes, { lang: 'en' });
  }),
);

test(
  'renders a favicon',
  withCleanup(t => {
    t.plan(1);
    render(<SeoUi {...props} />);
    const { linkTags } = Helmet.peek() as any;
    t.deepEqual(linkTags, [{ rel: 'shortcut icon', href: 'icon.png' }]);
  }),
);

test(
  'renders meta tags',
  withCleanup(t => {
    t.plan(1);
    render(<SeoUi {...props} />);
    const { metaTags } = Helmet.peek() as any;
    t.deepEqual(metaTags, [
      { name: 'theme-color', content: '#7bc3d1' },
      { name: 'description', content: 'my description' },
      { name: 'keywords', content: 'key,words' },
      { name: 'author', content: 'me' },
    ]);
  }),
);
