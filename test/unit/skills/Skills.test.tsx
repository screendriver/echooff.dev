import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Skills } from '../../../src/skills/Skills';
import { FiAward } from 'react-icons/fi';
import { Card } from '../../../src/skills/Card';

function renderSkillsIcon(): ReactTestRenderer {
    return create(<Skills />);
}

test('renders a <section /> element', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElements = root.findAllByType('section');

    t.is(sectionElements.length, 1);
});

test('renders a <h3 /> inside the <section /> with the text "Skills"', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const headingElements = sectionElement.findAllByType('h3');

    t.is(headingElements.at(0)?.children.at(0), 'Skills');
});

test('renders an award icon inside the heading element', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const headingElements = sectionElement.findAllByType('h3');
    const awardIconElements = headingElements.at(0)?.findAllByType(FiAward);

    t.is(awardIconElements?.length, 1);
});

test('renders a <hr /> inside the <section />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const hrElements = sectionElement.findAllByType('hr');

    t.is(hrElements.length, 1);
});

test('renders six <Card /> components', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);

    t.is(cardElements.length, 6);
});

test('renders a TypeScript <Card />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);
    const typeScriptCard = cardElements.at(0);

    t.is(typeScriptCard?.props.title, 'TypeScript');
    t.is(typeScriptCard?.props.description, 'is a typed superset of JavaScript that compiles to plain JavaScript.');
    t.is(typeScriptCard?.props.style, 'from-dracula to-dracula-cyan');
    t.deepEqual(typeScriptCard?.props.link, new URL('https://www.typescriptlang.org'));
});

test('renders a JavaScript <Card />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);
    const javaScriptCard = cardElements.at(1);

    t.is(javaScriptCard?.props.title, 'JavaScript');
    t.is(
        javaScriptCard?.props.description,
        'is a high-level, interpreted programming language that conforms to the ECMAScript specification.',
    );
    t.is(javaScriptCard?.props.style, 'from-yellow to-dracula-pink');
    t.deepEqual(
        javaScriptCard?.props.link,
        new URL('https://www.ecma-international.org/publications/standards/Ecma-262.htm'),
    );
});

test('renders a React <Card />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);
    const reactCard = cardElements.at(2);

    t.is(reactCard?.props.title, 'React');
    t.is(reactCard?.props.description, 'is a library for building user interfaces.');
    t.is(reactCard?.props.style, 'from-dracula to-dracula-cyan');
    t.deepEqual(reactCard?.props.link, new URL('https://reactjs.org'));
});

test('renders a Node.js <Card />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);
    const nodejsCard = cardElements.at(3);

    t.is(nodejsCard?.props.title, 'Node.js');
    t.is(nodejsCard?.props.description, "is a JavaScript runtime built on Chrome's V8 JavaScript engine.");
    t.is(nodejsCard?.props.style, 'from-yellow to-dracula-pink');
    t.deepEqual(nodejsCard?.props.link, new URL('https://nodejs.org'));
});

test('renders a CSS <Card />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);
    const cssCard = cardElements.at(4);

    t.is(cssCard?.props.title, 'Cascading Style Sheets (CSS)');
    t.is(
        cssCard?.props.description,
        'is a simple mechanism for adding style (e.g., fonts, colors, spacing) to Web documents.',
    );
    t.is(cssCard?.props.style, 'from-dracula to-dracula-cyan');
    t.deepEqual(cssCard?.props.link, new URL('https://www.w3.org/Style/CSS/'));
});

test('renders a Elm <Card />', (t) => {
    const { root } = renderSkillsIcon();
    const sectionElement = root.findByType('section');
    const divElement = sectionElement.findByType('div');
    const cardElements = divElement.findAllByType(Card);
    const elmCard = cardElements.at(5);

    t.is(elmCard?.props.title, 'Elm');
    t.is(elmCard?.props.description, 'is a delightful language for reliable webapps.');
    t.is(elmCard?.props.style, 'from-yellow to-dracula-pink');
    t.deepEqual(elmCard?.props.link, new URL('https://elm-lang.org'));
});
