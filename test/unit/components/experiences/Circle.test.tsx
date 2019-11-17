import { expect } from 'chai';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Circle } from '../../../../src/components/experiences/Circle';
import { Experience } from '../../../../src/components/experiences';

function renderCircle(className?: string) {
  const experience: Experience = {
    from: 'now',
    to: 'later',
    industry: 'test-industry',
    jobDescription: 'my-description',
    jobTitle: 'My job',
  };
  return render(<Circle className={className} experience={experience} />);
}

suite('<Circle />', () => {
  teardown(cleanup);

  test('<Circle /> accepts and renders a CSS className', () => {
    const { container } = renderCircle('css-awesome');
    const actual = container.querySelector('.css-awesome');
    expect(actual).to.not.equal(null);
  });

  test('<Circle /> renders experience "to"', () => {
    const { getByLabelText } = renderCircle();
    getByLabelText('Experience to');
  });

  test('<Circle /> renders experience "from"', () => {
    const { getByLabelText } = renderCircle();
    getByLabelText('Experience from');
  });
});
