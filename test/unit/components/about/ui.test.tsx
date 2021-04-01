import { assert } from 'chai';
import React from 'react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render } from '@testing-library/react';
import { AboutUi, AboutUiProps } from '../../../../src/components/about/ui';

function renderAboutUi() {
  const props: AboutUiProps = {
    imageData: {
      width: 800,
      height: 600,
      images: { sources: [{ type: '', srcSet: 'myImage.png 1x' }] },
      layout: 'constrained',
    },
  };
  return render(
    <I18nextProvider i18n={i18next}>
      <AboutUi {...props} />
    </I18nextProvider>,
  );
}

suite('<AboutUi />', function () {
  suiteSetup(function () {
    return i18next.use(initReactI18next).init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            about: {
              text:
                '<0>JavaScript is everywhere.</0><1>Those days are gone.</1><2>The rise of Node.js</2>',
            },
          },
        },
      },
    });
  });

  test('renders an about image', function () {
    const { getByAltText } = renderAboutUi();
    const source = getByAltText('My face').previousSibling as HTMLSourceElement;
    assert.equal(source.getAttribute('data-srcset'), 'myImage.png 1x');
  });

  test('renders a "JavaScript is everywhere" paragraph', function () {
    const { queryByText } = renderAboutUi();
    const textElement = queryByText('JavaScript is everywhere.');
    assert.isNotNull(textElement);
  });

  test('renders a "Those days are gone" heading', function () {
    const { queryByText } = renderAboutUi();
    const textElement = queryByText('Those days are gone.');
    assert.isNotNull(textElement);
  });

  test('renders a "The rise of Node.js" paragraph', function () {
    const { queryByText } = renderAboutUi();
    const textElement = queryByText('The rise of Node.js');
    assert.isNotNull(textElement);
  });
});
