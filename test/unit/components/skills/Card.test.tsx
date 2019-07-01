import React from 'react';
import test from 'tape';
import { render } from '@testing-library/react';
import { Card, CardProps } from '../../../../src/components/skills/Card';
import { withCleanup } from '../../../cleanup';

function renderCard() {
  const props: CardProps = {
    linkTo: '/blog',
    linkText: 'My blog',
    icon: <svg data-testid="test-svg" />,
    description: 'This is a test',
  };
  return render(<Card {...props} />);
}

test(
  '<Card /> renders a link that links to given "linkTo" prop',
  withCleanup(t => {
    t.plan(1);
    const { getByTitle } = renderCard();
    getByTitle('My blog');
    t.pass();
  }),
);

test(
  '<Card /> renders given icon',
  withCleanup(t => {
    t.plan(1);
    const { getByTestId } = renderCard();
    getByTestId('test-svg');
    t.pass();
  }),
);

test(
  '<Card /> renders given linkText',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = renderCard();
    getByText('My blog');
    t.pass();
  }),
);

test(
  '<Card /> renders given description',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = renderCard();
    getByText('This is a test');
    t.pass();
  }),
);
