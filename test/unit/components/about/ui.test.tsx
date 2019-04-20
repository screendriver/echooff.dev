import React from 'react';
import test from 'tape';
import { render } from 'react-testing-library';
import { withCleanup } from '../../../cleanup';
import { AboutUi, AboutUiProps } from '../../../../src/components/about/ui';

const props: AboutUiProps = {
  fixedImage: {
    width: 800,
    height: 600,
    src: 'myImage.png',
    srcSet: 'myImage.png 1x',
  },
};

test(
  'renders an about image',
  withCleanup(async t => {
    t.plan(4);
    const { getByAltText } = render(<AboutUi {...props} />);
    const image = getByAltText('My face');
    t.equal(image.getAttribute('src'), 'myImage.png');
    t.equal(image.getAttribute('srcset'), 'myImage.png 1x');
    t.equal(image.getAttribute('width'), '800');
    t.equal(image.getAttribute('height'), '600');
  }),
);

test(
  'renders a "JavaScript is everywhere" paragraph',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = render(<AboutUi {...props} />);
    getByText(
      'JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front end web developer. Forever bound to the browser.',
    );
    t.pass();
  }),
);

test(
  'renders a "Those days are gone" heading',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = render(<AboutUi {...props} />);
    getByText('Those days are gone.');
    t.pass();
  }),
);

test(
  'renders a "The rise of Node.js" paragraph',
  withCleanup(t => {
    t.plan(1);
    const { getByText } = render(<AboutUi {...props} />);
    getByText(
      'The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t necessarily mean a front-end web developer. As a JavaScript developer today, you can target more platforms than any other high level language.',
    );
    t.pass();
  }),
);
