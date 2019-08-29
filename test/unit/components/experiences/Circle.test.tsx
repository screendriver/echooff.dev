import React from 'react';
import { render } from '@testing-library/react';
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

test('<Circle /> accepts and renders a CSS className', () => {
  const { container } = renderCircle('css-awesome');
  const actual = container.querySelector('.css-awesome');
  expect(actual).not.toBe(null);
});

test('<Circle /> renders experience "to"', () => {
  const { getByLabelText } = renderCircle();
  getByLabelText('Experience to');
});

test('<Circle /> renders experience "from"', () => {
  const { getByLabelText } = renderCircle();
  getByLabelText('Experience from');
});
