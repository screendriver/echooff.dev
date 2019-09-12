import test from 'ava';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Footer, FooterProps } from '../../../src/components/Footer';

test.afterEach(cleanup);

function renderFooter() {
  const props: FooterProps = {
    date: new Date(2019, 0),
  };
  return render(<Footer {...props} />);
}

test('<Footer /> renders given copyright date', t => {
  const { getByText } = renderFooter();
  const element = getByText('Copyright', { exact: false });
  t.is(element.textContent!.includes('2019'), true);
});

test('<Footer /> renders an "inspired by" link', t => {
  const { getByText } = renderFooter();
  const element = getByText('TemplateWire');
  t.is(element.getAttribute('href'), 'http://www.templatewire.com/');
});
