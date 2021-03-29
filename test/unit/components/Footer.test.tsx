import { assert } from 'chai';
import React from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nextProvider } from 'react-i18next';
import { render } from '@testing-library/react';
import { Footer } from '../../../src/components/Footer';

function renderFooter(date: Date) {
  return render(
    <I18nextProvider i18n={i18next}>
      <Footer date={date} />
    </I18nextProvider>,
  );
}

suite('<Footer />', function () {
  suiteSetup(function () {
    return i18next.use(initReactI18next).init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            footer: {
              copyright:
                'Copyright © {{year}} Me. Design inspired by <1>TemplateWire</1>',
            },
          },
        },
      },
    });
  });

  test('<Footer /> renders a copyright and an "inspired by" link', function () {
    const date = new Date(2020, 0);
    const { getByLabelText } = renderFooter(date);
    const element = getByLabelText('Footer');
    assert.equal(
      element.innerHTML,
      'Copyright © 2020 Me. Design inspired by <a href="http://www.templatewire.com/">TemplateWire</a>',
    );
  });
});
