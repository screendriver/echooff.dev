import assert from 'assert'
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

suite('<Circle />', function () {
  test('<Circle /> accepts and renders a CSS className', function () {
    const { container } = renderCircle('css-awesome');
    const actual = container.querySelector('.css-awesome');
    assert.notStrictEqual(actual, null);
  });

  test('<Circle /> renders experience "to"', function () {
    const { queryByLabelText } = renderCircle();
    const circleElement = queryByLabelText('Experience to');
    assert.notStrictEqual(circleElement, null);
  });

  test('<Circle /> renders experience "from"', function () {
    const { queryByLabelText } = renderCircle();
    const circleElement = queryByLabelText('Experience from');
    assert.notStrictEqual(circleElement, null);
  });
});
