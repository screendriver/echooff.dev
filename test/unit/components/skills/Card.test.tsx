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

suite('<Card />', function () {
  test('<Card /> renders a link that links to given "linkTo" prop', function () {
    const { getByTitle } = renderCard();
    getByTitle('My blog');
  });

  test('<Card /> renders given icon', function () {
    const { getByTestId } = renderCard();
    getByTestId('test-svg');
  });

  test('<Card /> renders given linkText', function () {
    const { getByText } = renderCard();
    getByText('My blog');
  });

  test('<Card /> renders given description', function () {
    const { getByText } = renderCard();
    getByText('This is a test');
  });
});
