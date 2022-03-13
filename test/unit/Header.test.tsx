import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { ImageDataLike } from 'gatsby-plugin-image';
import { Header, HeaderProps } from '../../src/Header';

const imageDataLikeFactory = Factory.define<ImageDataLike>(() => {
    return {
        id: '',
        parent: null,
        children: [],
        internal: {},
        childImageSharp: {
            gatsbyImageData: {
                layout: 'fullWidth',
                placeholder: {
                    fallback: 'data:image/jpeg;base64',
                },
                images: {
                    fallback: {
                        src: '/header.jpg',
                        srcSet: '/header-set.jpg',
                        sizes: '100vw',
                    },
                    sources: [
                        {
                            srcSet: '/header.avif',
                            type: 'image/avif',
                            sizes: '100vw',
                        },
                        {
                            srcSet: '/header.webp',
                            type: 'image/webp',
                            sizes: '100vw',
                        },
                    ],
                },
                width: 1,
                height: 0.5,
            },
        },
    } as unknown as ImageDataLike;
});

const headerPropsFactory = Factory.define<HeaderProps>(() => {
    return {
        headerImage: imageDataLikeFactory.build(),
    };
});

function renderHeader(overrides?: Partial<HeaderProps>): ReactTestRenderer {
    const props = headerPropsFactory.build(overrides);
    return create(<Header {...props} />);
}

test('renders nothing when there is no header image', (t) => {
    const props = headerPropsFactory.build({
        headerImage: undefined,
    });
    const { root } = renderHeader(props);

    t.is(root.children.length, 0);
});

test('renders an image', (t) => {
    const { root } = renderHeader();
    const figureElement = root.findByType('figure');
    const imageElements = figureElement.findAllByType('img');

    t.is(imageElements.length, 3);
});

test('renders "$ whoami"', (t) => {
    const { root } = renderHeader();
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(0)?.children, ['$ whoami']);
});

test('renders "Christian"', (t) => {
    const { root } = renderHeader();
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(1)?.children, ['Christian']);
});

test('renders "$ groups"', (t) => {
    const { root } = renderHeader();
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(2)?.children, ['$ groups']);
});

test('renders "Full-Stack JavaScript Engineer"', (t) => {
    const { root } = renderHeader();
    const codeElement = root.findByType('code');
    const paragraphElements = codeElement.findAllByType('p');

    t.deepEqual(paragraphElements.at(3)?.children, ['Full-Stack JavaScript Engineer']);
});
