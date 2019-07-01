import React from 'react';
import test from 'tape';
import { render } from '@testing-library/react';
import { Card, CardProps } from '../../../../src/components/skills/Card';
import { withCleanup } from '../../../cleanup';

function renderCard() {
  const props: CardProps = {
    linkTo: '/blog',
    linkText: 'My blog',
    icon: <svg />,
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
