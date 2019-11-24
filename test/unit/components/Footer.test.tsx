import { assert } from 'chai';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Footer, FooterProps } from '../../../src/components/Footer';

function renderFooter() {
  const props: FooterProps = {
    date: new Date(2019, 0),
  };
  return render(<Footer {...props} />);
}

suite('<Footer />', function() {
  teardown(cleanup);

  test('<Footer /> renders given copyright date', function() {
    const { getByText } = renderFooter();
    const element = getByText('Copyright', { exact: false });
    assert.include(element.textContent, '2019');
  });

  test('<Footer /> renders an "inspired by" link', function() {
    const { getByText } = renderFooter();
    const element = getByText('TemplateWire');
    assert.equal(element.getAttribute('href'), 'http://www.templatewire.com/');
  });
});
