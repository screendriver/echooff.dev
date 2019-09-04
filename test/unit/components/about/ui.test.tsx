import test from 'ava';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { AboutUi, AboutUiProps } from '../../../../src/components/about/ui';

const props: AboutUiProps = {
  fixedImage: {
    width: 800,
    height: 600,
    src: 'myImage.png',
    srcSet: 'myImage.png 1x',
  },
};

test.afterEach(cleanup);

test('renders an about image', t => {
  const { getByAltText } = render(<AboutUi {...props} />);
  const image = getByAltText('My face');
  t.is(image.getAttribute('src'), 'myImage.png');
  t.is(image.getAttribute('srcset'), 'myImage.png 1x');
  t.is(image.getAttribute('width'), '800');
  t.is(image.getAttribute('height'), '600');
});

test('renders a "JavaScript is everywhere" paragraph', t => {
  const { getByText } = render(<AboutUi {...props} />);
  getByText(
    'JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front end web developer. Forever bound to the browser.',
  );
  t.pass();
});

test('renders a "Those days are gone" heading', t => {
  const { getByText } = render(<AboutUi {...props} />);
  getByText('Those days are gone.');
  t.pass();
});

test('renders a "The rise of Node.js" paragraph', t => {
  const { getByText } = render(<AboutUi {...props} />);
  getByText(
    'The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t necessarily mean a front-end web developer. As a JavaScript developer today, you can target more platforms than any other high level language.',
  );
  t.pass();
});
