import React from 'react';
import test from 'tape';
import { render } from '@testing-library/react';
import { Circle } from '../../../../src/components/experiences/Circle';
import { Experience } from '../../../../src/components/experiences';
import { withCleanup } from '../../../cleanup';

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

test(
  '<Circle /> accepts and renders a CSS className',
  withCleanup(t => {
    t.plan(1);
    const { container } = renderCircle('css-awesome');
    const actual = container.querySelector('.css-awesome');
    t.not(actual, null);
  }),
);

test(
  '<Circle /> renders experience "to"',
  withCleanup(t => {
    t.plan(1);
    const { getByLabelText } = renderCircle();
    getByLabelText('Experience to');
    t.pass();
  }),
);

test(
  '<Circle /> renders experience "from"',
  withCleanup(t => {
    t.plan(1);
    const { getByLabelText } = renderCircle();
    getByLabelText('Experience from');
    t.pass();
  }),
);
