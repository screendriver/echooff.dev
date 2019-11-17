import { expect } from 'chai';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Helmet from 'react-helmet';
import { SeoUi, SeoUiProps } from '../../../../src/components/seo/ui';

const props: SeoUiProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

suite('<SeoUi />', () => {
  teardown(cleanup);

  test('renders a title', () => {
    render(<SeoUi {...props} />);
    const { title } = Helmet.peek();
    expect(title).to.equal('test title');
  });

  test('renders lang "en" HTML attribute', () => {
    render(<SeoUi {...props} />);
    const { htmlAttributes } = Helmet.peek();
    expect(htmlAttributes).to.deep.equal({ lang: 'en' });
  });

  test('renders a favicon', () => {
    render(<SeoUi {...props} />);
    const { linkTags } = Helmet.peek() as any;
    expect(linkTags).to.deep.equal([
      { rel: 'shortcut icon', href: 'icon.png' },
    ]);
  });

  test('renders meta tags', () => {
    render(<SeoUi {...props} />);
    const { metaTags } = Helmet.peek() as any;
    expect(metaTags).to.deep.equal([
      { name: 'theme-color', content: '#7bc3d1' },
      { name: 'description', content: 'my description' },
      { name: 'keywords', content: 'key,words' },
      { name: 'author', content: 'me' },
    ]);
  });
});
