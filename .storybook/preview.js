import 'modern-normalize';
import 'typeface-open-sans';
import 'typeface-lato';
import React, { Suspense } from 'react';
import { Global } from '@emotion/core';
import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { addParameters, addDecorator } from '@storybook/client-api';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

i18next
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
});

addDecorator((story) => (
  <>
    <Global
      styles={{
        body: {
          fontFamily: 'Open Sans, sans-serif',
          WebkitFontSmoothing: 'antialiased',
        },
        a: {
          textDecoration: 'none',
        },
      }}
    />
    <I18nextProvider i18next={i18next}>
      <Suspense fallback={<div>loading...</div>}>{story()}</Suspense>
    </I18nextProvider>
  </>
));
