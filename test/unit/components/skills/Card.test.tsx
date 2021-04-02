import { assert } from 'chai';
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
    const { queryByTitle } = renderCard();
    const cardElement = queryByTitle('My blog');
    assert.isNotNull(cardElement);
  });

  test('<Card /> renders given icon', function () {
    const { queryByTestId } = renderCard();
    const cardElement = queryByTestId('test-svg');
    assert.isNotNull(cardElement);
  });

  test('<Card /> renders given linkText', function () {
    const { queryByText } = renderCard();
    const cardElement = queryByText('My blog');
    assert.isNotNull(cardElement);
  });

  test('<Card /> renders given description', function () {
    const { queryByText } = renderCard();
    const cardElement = queryByText('This is a test');
    assert.isNotNull(cardElement);
  });
});
