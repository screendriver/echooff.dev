import assert from 'assert'
import { render } from '@testing-library/react';
import { Helmet, HelmetTags } from 'react-helmet';
import { SeoUi, SeoUiProps } from '../../../../src/components/seo/ui';

const props: SeoUiProps = {
  title: 'test title',
  description: 'my description',
  author: 'me',
  keywords: 'key,words',
  favicon: 'icon.png',
};

suite('<SeoUi />', function () {
  test('renders a title', function () {
    render(<SeoUi {...props} />);
    const { title } = Helmet.peek();
    assert.strictEqual(title, 'test title');
  });

  test('renders lang "en" HTML attribute', function () {
    render(<SeoUi {...props} />);
    const { htmlAttributes } = Helmet.peek();
    assert.deepStrictEqual(htmlAttributes, {
      lang: 'en',
    });
  });

  test('renders a favicon', function () {
    render(<SeoUi {...props} />);
    const { linkTags } = Helmet.peek() as unknown as HelmetTags;
    assert.deepStrictEqual<Partial<HTMLLinkElement>[]>(linkTags, [
      { rel: 'shortcut icon', href: 'icon.png' },
    ]);
  });

  test('renders meta tags', function () {
    render(<SeoUi {...props} />);
    const { metaTags } = Helmet.peek() as unknown as HelmetTags;
    assert.deepStrictEqual<Partial<HTMLMetaElement>[]>(metaTags, [
      { name: 'theme-color', content: '#7bc3d1' },
      { name: 'description', content: 'my description' },
      { name: 'keywords', content: 'key,words' },
      { name: 'author', content: 'me' },
    ]);
  });
});
