import React from 'react';
import { render, cleanup } from '@testing-library/react';
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

suite('<Card />', () => {
  teardown(cleanup);

  test('<Card /> renders a link that links to given "linkTo" prop', () => {
    const { getByTitle } = renderCard();
    getByTitle('My blog');
  });

  test('<Card /> renders given icon', () => {
    const { getByTestId } = renderCard();
    getByTestId('test-svg');
  });

  test('<Card /> renders given linkText', () => {
    const { getByText } = renderCard();
    getByText('My blog');
  });

  test('<Card /> renders given description', () => {
    const { getByText } = renderCard();
    getByText('This is a test');
  });
});
