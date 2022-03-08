import React from 'react';
import test from 'ava';
import { create } from 'react-test-renderer';
import { About } from '../../../src/about/About';

test('renders a heading with the text "About"', (t) => {
    const { root } = create(<About />);
    const sectionElement = root.findByType('section');
    const headingElement = sectionElement.findByType('h3');

    t.is(headingElement.children.at(0), 'About');
});

test('renders a horizontal line', (t) => {
    const { root } = create(<About />);
    const sectionElement = root.findByType('section');
    const hrElements = sectionElement.findAllByType('hr');

    t.is(hrElements.length, 1);
});

test('renders a paragraph within an article with the first description', (t) => {
    const { root } = create(<About />);
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.is(paragraphElements.length, 2);
    t.deepEqual(paragraphElements.at(0)?.children, [
        'JavaScript is everywhere. In the old days, being a JavaScript developer meant that you were a front end web developer. Forever bound to the browser.',
    ]);
});

test('renders a strong text within an article', (t) => {
    const { root } = create(<About />);
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const strongElement = articleElement.findByType('strong');

    t.deepEqual(strongElement.children, ['Those days are gone']);
});

test('renders a second paragraph within an article with the second description', (t) => {
    const { root } = create(<About />);
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.is(paragraphElements.length, 2);
    t.deepEqual(paragraphElements.at(1)?.children, [
        'The rise of Node.js ushered in a new era. An era where being a JavaScript developer doesn’t necessarily mean a front-end web developer. As a JavaScript developer today, you can target more platforms than any other high level language.',
    ]);
});
