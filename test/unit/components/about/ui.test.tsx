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
    srcSet: 'myImage.png',
  },
};

test(
  'renders a "JavaScript is everywhere" paragraph',
  withCleanup(t => {
    t.plan(2);
    const { getByTestId } = render(<AboutUi {...props} />);
    const everywhere = getByTestId('everywhere');
    t.equal(
      everywhere.textContent,
      'JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front end web developer. Forever bound to the browser.',
    );
    t.equal(everywhere.tagName, 'P');
  }),
);

test(
  'renders a "Those days are gone" heading',
  withCleanup(t => {
    t.plan(2);
    const { getByTestId } = render(<AboutUi {...props} />);
    const gone = getByTestId('gone');
    t.equal(gone.textContent, 'Those days are gone.');
    t.equal(gone.tagName, 'H5');
  }),
);

test(
  'renders a "The rise of Node.js" paragraph',
  withCleanup(t => {
    t.plan(2);
    const { getByTestId } = render(<AboutUi {...props} />);
    const rise = getByTestId('rise');
    t.equal(
      rise.textContent,
      'The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t necessarily mean a front-end web developer. As a JavaScript developer today, you can target more platforms than any other high level language.',
    );
    t.equal(rise.tagName, 'P');
  }),
);
