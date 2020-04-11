import { assert } from 'chai';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Helmet, HelmetHTMLElementDatum, HelmetDatum } from 'react-helmet';
import { SeoUi, SeoUiProps } from '../../../../src/components/seo/ui';

const props: SeoUiProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

suite('<SeoUi />', function () {
  teardown(cleanup);

  test('renders a title', function () {
    render(<SeoUi {...props} />);
    const { title } = Helmet.peek();
    assert.equal(title, ('test title' as unknown) as HelmetDatum);
  });

  test('renders lang "en" HTML attribute', function () {
    render(<SeoUi {...props} />);
    const { htmlAttributes } = Helmet.peek();
    assert.deepEqual(htmlAttributes, ({
      lang: 'en',
    } as unknown) as HelmetHTMLElementDatum);
  });

  test('renders a favicon', function () {
    render(<SeoUi {...props} />);
    const { linkTags } = Helmet.peek() as any;
    assert.deepEqual(linkTags, [{ rel: 'shortcut icon', href: 'icon.png' }]);
  });

  test('renders meta tags', function () {
    render(<SeoUi {...props} />);
    const { metaTags } = Helmet.peek() as any;
    assert.deepEqual(metaTags, [
      { name: 'theme-color', content: '#7bc3d1' },
      { name: 'description', content: 'my description' },
      { name: 'keywords', content: 'key,words' },
      { name: 'author', content: 'me' },
    ]);
  });
});
