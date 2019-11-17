import { expect } from 'chai';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Footer, FooterProps } from '../../../src/components/Footer';

function renderFooter() {
  const props: FooterProps = {
    date: new Date(2019, 0),
  };
  return render(<Footer {...props} />);
}

suite('<Footer />', () => {
  teardown(cleanup);

  test('<Footer /> renders given copyright date', () => {
    const { getByText } = renderFooter();
    const element = getByText('Copyright', { exact: false });
    expect(element.textContent).to.includes('2019');
  });

  test('<Footer /> renders an "inspired by" link', () => {
    const { getByText } = renderFooter();
    const element = getByText('TemplateWire');
    expect(element.getAttribute('href')).to.equal(
      'http://www.templatewire.com/',
    );
  });
});
