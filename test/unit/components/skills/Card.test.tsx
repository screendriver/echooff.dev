import test from 'ava';
import React from 'react';
import { render } from '@testing-library/react';
import { Card, CardProps } from '../../../../src/components/skills/Card';

function renderCard() {
  const props: CardProps = {
    linkTo: '/blog',
    linkText: 'My blog',
    icon: <svg data-testid="test-svg" />,
    description: 'This is a test',
  };
  return render(<Card {...props} />);
}

test('<Card /> renders a link that links to given "linkTo" prop', t => {
  const { getByTitle } = renderCard();
  getByTitle('My blog');
  t.pass();
});

test('<Card /> renders given icon', t => {
  const { getByTestId } = renderCard();
  getByTestId('test-svg');
  t.pass();
});

test('<Card /> renders given linkText', t => {
  const { getByText } = renderCard();
  getByText('My blog');
  t.pass();
});

test('<Card /> renders given description', t => {
  const { getByText } = renderCard();
  getByText('This is a test');
  t.pass();
});
