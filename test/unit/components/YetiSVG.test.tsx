import React from 'react';
import { render } from 'react-testing-library';
import { YetiSVG } from '../../../src/components/YetiSVG';

test('renders correctly', () => {
  const { container } = render(<YetiSVG />);
  expect(container.firstChild).toMatchSnapshot();
});
