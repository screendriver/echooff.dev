import { assert } from 'chai';
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

suite('<AboutUi />', function() {
  teardown(cleanup);

  test('renders an about image', function() {
    const { getByAltText } = render(<AboutUi {...props} />);
    const image = getByAltText('My face');
    assert.equal(image.getAttribute('src'), 'myImage.png');
    assert.equal(image.getAttribute('srcset'), 'myImage.png 1x');
    assert.equal(image.getAttribute('width'), '800');
    assert.equal(image.getAttribute('height'), '600');
  });

  test('renders a "JavaScript is everywhere" paragraph', function() {
    const { getByText } = render(<AboutUi {...props} />);
    getByText(
      'JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front end web developer. Forever bound to the browser.',
    );
  });

  test('renders a "Those days are gone" heading', function() {
    const { getByText } = render(<AboutUi {...props} />);
    getByText('Those days are gone.');
  });

  test('renders a "The rise of Node.js" paragraph', function() {
    const { getByText } = render(<AboutUi {...props} />);
    getByText(
      'The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t necessarily mean a front-end web developer. As a JavaScript developer today, you can target more platforms than any other high level language.',
    );
  });
});
