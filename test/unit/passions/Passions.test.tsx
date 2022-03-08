import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { FiActivity, FiCheck, FiCloud, FiCompass, FiHeart, FiLayers, FiServer, FiZap } from 'react-icons/fi';
import { Passions } from '../../../src/passions/Passions';

function renderPassions(): ReactTestRenderer {
    return create(<Passions />);
}

test('renders a <section /> as root element', (t) => {
    const { root } = renderPassions();
    const sectionElements = root.findAllByType('section');

    t.is(sectionElements.length, 1);
});

test('renders a <h3 /> with "Passions" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const headingElement = sectionElement.findByType('h3');

    t.is(headingElement.children.at(0), 'Passions');
});

test('renders a <h3 /> with an heart icon', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const headingElement = sectionElement.findByType('h3');
    const heartIconElements = headingElement.findAllByType(FiHeart);

    t.is(heartIconElements.length, 1);
});

test('renders a horizontal line', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const hrElements = sectionElement.findAllByType('hr');

    t.is(hrElements.length, 1);
});

test('renders an <article /> element', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElements = sectionElement.findAllByType('article');

    t.is(articleElements.length, 1);
});

test('renders an activity icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const activityElements = articleElement.findAllByType(FiActivity);

    t.is(activityElements.length, 1);
});

test('renders a paragraph with "Agile" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(0)?.children, ['Agile']);
});

test('renders an clean code icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const compassIconElements = articleElement.findAllByType(FiCompass);

    t.is(compassIconElements.length, 1);
});

test('renders a paragraph with "Clean Code" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(1)?.children, ['Clean Code']);
});

test('renders a performance icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const zapIconElements = articleElement.findAllByType(FiZap);

    t.is(zapIconElements.length, 1);
});

test('renders a paragraph with "Performance" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(2)?.children, ['Performance']);
});

test('renders a serverless icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const serverIconElements = articleElement.findAllByType(FiServer);

    t.is(serverIconElements.length, 1);
});

test('renders a paragraph with "Serverless" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(3)?.children, ['Serverless']);
});

test('renders a layers icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const layersIconElements = articleElement.findAllByType(FiLayers);

    t.is(layersIconElements.length, 1);
});

test('renders a paragraph with "JAMStack" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(4)?.children, ['JAMStack']);
});

test('renders a cloud icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const cloudIconElements = articleElement.findAllByType(FiCloud);

    t.is(cloudIconElements.length, 1);
});

test('renders a paragraph with "Cloud" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(5)?.children, ['Cloud']);
});

test('renders a TDD icon in an <article />', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const checkIconElements = articleElement.findAllByType(FiCheck);

    t.is(checkIconElements.length, 1);
});

test('renders a paragraph with "TDD" as text', (t) => {
    const { root } = renderPassions();
    const sectionElement = root.findByType('section');
    const articleElement = sectionElement.findByType('article');
    const paragraphElements = articleElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(6)?.children, ['TDD']);
});
