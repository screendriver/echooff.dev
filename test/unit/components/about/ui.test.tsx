import React from 'react';
import { render } from '@testing-library/react';
import { AboutUi, AboutUiProps } from '../../../../src/components/about/ui';

const props: AboutUiProps = {
  fixedImage: {
    width: 800,
    height: 600,
    src: 'myImage.png',
    srcSet: 'myImage.png 1x',
  },
};

test('renders an about image', () => {
  const { getByAltText } = render(<AboutUi {...props} />);
  const image = getByAltText('My face');
  expect(image.getAttribute('src')).toBe('myImage.png');
  expect(image.getAttribute('srcset')).toBe('myImage.png 1x');
  expect(image.getAttribute('width')).toBe('800');
  expect(image.getAttribute('height')).toBe('600');
});

test('renders a "JavaScript is everywhere" paragraph', () => {
  const { getByText } = render(<AboutUi {...props} />);
  getByText(
    'JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front end web developer. Forever bound to the browser.',
  );
});

test('renders a "Those days are gone" heading', () => {
  const { getByText } = render(<AboutUi {...props} />);
  getByText('Those days are gone.');
});

test('renders a "The rise of Node.js" paragraph', () => {
  const { getByText } = render(<AboutUi {...props} />);
  getByText(
    'The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t necessarily mean a front-end web developer. As a JavaScript developer today, you can target more platforms than any other high level language.',
  );
});
