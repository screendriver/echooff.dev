import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { JavaScriptIcon, JavaScriptIconProps } from '../../../../src/skills/icons/JavaScriptIcon';

const javaScriptIconPropsFactory = Factory.define<JavaScriptIconProps>(() => {
    return {};
});

function renderJavaScriptIcon(propsOverrides?: Partial<JavaScriptIconProps>): ReactTestRenderer {
    const props = javaScriptIconPropsFactory.build(propsOverrides);
    return create(<JavaScriptIcon className={props.className} />);
}

test('renders an <svg /> element', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElements = root.findAllByType('svg');

    t.is(svgElements.length, 1);
});

test('<svg /> element has 100% width and height', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.width, '100%');
    t.is(svgElement.props.height, '100%');
});

test('<svg /> element has a viewbox set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.viewBox, '0 0 256.4 291.5');
});

test('<svg /> element does not have a className by default', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, undefined);
});

test('<svg /> accepts a className', (t) => {
    const props = javaScriptIconPropsFactory.build({
        className: 'foo',
    });
    const { root } = renderJavaScriptIcon(props);
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, 'foo');
});

test('<svg /> renders four <path /> elements', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.length, 4);
});

test('first <path /> element has correct fill color', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.fill, '#d4b830');
});

test('first <path /> element has correct d property set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(
        pathElements.at(0)?.props.d,
        'M23.788 262.015l-23.8-262 256.4.1-23.6 261.7-104.8 29.6-104.2-29.4zm189.7-14.3l19.9-224.4h-105l.8 247.5 84.3-23.1zm-94.9-191.5h-25.5l-.3 134.3-49.5-13.5.1 30.7 75.2 20.3v-171.8z',
    );
});

test('second <path /> element has correct fill color', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(1)?.props.fill, 'none');
});

test('second <path /> element has correct d property set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(
        pathElements.at(1)?.props.d,
        'M110.188 225.515c-3.3-1-19.6-5.4-36.2-9.9l-30.1-8.1v-15.1c0-14.8 0-15.1 1.5-14.6.8.3 11.8 3.3 24.4 6.8l22.9 6.3.2-67 .2-67h25v85.2c0 67.7-.2 85.2-.9 85.2-.5-.1-3.7-.9-7-1.8z',
    );
});

test('second <path /> element has correct opacity set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(1)?.props.opacity, 0.986);
});

test('third <path /> element has correct fill color', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.fill, '#ebebeb');
});

test('third <path /> element has correct d property set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.d, 'M43.388 207.715l-.1-30.7s31.6 8.9 49.5 13.5l.3-134.2h25.5v171.7l-75.2-20.3z');
});

test('third <path /> element has correct fillOpacity set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.fillOpacity, 0.922);
});

test('third <path /> element has correct opacity set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.opacity, 0.986);
});

test('fourth <path /> element has correct fill color', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(3)?.props.fill, '#fdd83c');
});

test('fourth <path /> element has correct d property set', (t) => {
    const { root } = renderJavaScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(
        pathElements.at(3)?.props.d,
        'M128.388 23.215h105l-19.9 224.4-85.1 23.1v-247.5zm79.7 186.8l6.9-83.9-51 5.7v-44.8l54.4-.2 2.2-30.6-82.1.4 1.1 111.4 49.6-8.5-.7 24.8-50 13.3.5 30.4 69.1-18z',
    );
});
