import React from 'react';
import assert from 'assert';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { Card, CardProps } from '../../../src/skills/Card';

const cardIconPropsFactory = Factory.define<CardProps>(() => {
    return {
        icon: <div>Icon</div>,
        title: 'Test title',
        description: 'Test description',
        style: 'from-dracula to-dracula-cyan',
        link: new URL('https://example.com'),
    };
});

function renderCssIcon(): ReactTestRenderer {
    const props = cardIconPropsFactory.build();
    return create(<Card {...props} />);
}

test('renders an <article /> element', (t) => {
    const { root } = renderCssIcon();
    const articleElements = root.findAllByType('article');

    t.is(articleElements.length, 1);
});

test('<article /> includes the correct style as className', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const { className } = articleElement.props;

    assert(typeof className === 'string');
    t.true(className.includes('from-dracula to-dracula-cyan'));
});

test('renders an <a /> element inside <article />', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const anchorElements = articleElement.findAllByType('a');

    t.is(anchorElements.length, 1);
});

test('<a /> has correct href set', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const anchorElement = articleElement.findByType('a');

    t.is(anchorElement.props.href, 'https://example.com/');
});

test('<a /> has correct title set', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const anchorElement = articleElement.findByType('a');

    t.is(anchorElement.props.title, 'Test title');
});

test('<a /> renders given icon as child', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const anchorElement = articleElement.findByType('a');
    const iconElement = anchorElement.children.at(0);

    assert(typeof iconElement !== 'undefined' && typeof iconElement !== 'string');
    t.deepEqual(iconElement.children, ['Icon']);
});

test('<a /> renders a heading with the given title', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const headingElement = articleElement.findByType('h3');

    t.deepEqual(headingElement.children, ['Test title']);
});

test('<a /> renders a paragraph with the given description', (t) => {
    const { root } = renderCssIcon();
    const articleElement = root.findByType('article');
    const paragraphElement = articleElement.findByType('p');

    t.deepEqual(paragraphElement.children, ['Test description']);
});
