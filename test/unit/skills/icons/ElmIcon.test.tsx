import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { ElmIcon, ElmIconProps } from '../../../../src/skills/icons/ElmIcon';

const elmIconPropsFactory = Factory.define<ElmIconProps>(() => {
    return {};
});

function renderElmIcon(propsOverrides?: Partial<ElmIconProps>): ReactTestRenderer {
    const props = elmIconPropsFactory.build(propsOverrides);
    return create(<ElmIcon className={props.className} />);
}

test('renders an <svg /> element', (t) => {
    const { root } = renderElmIcon();
    const svgElements = root.findAllByType('svg');

    t.is(svgElements.length, 1);
});

test('<svg /> element has 100% width and height', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.width, '100%');
    t.is(svgElement.props.height, '100%');
});

test('<svg /> element has a viewbox set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.viewBox, '0 0 323.141 322.95');
});

test('<svg /> element does not have a className by default', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, undefined);
});

test('<svg /> accepts a className', (t) => {
    const props = elmIconPropsFactory.build({
        className: 'foo',
    });
    const { root } = renderElmIcon(props);
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, 'foo');
});

test('<svg /> renders six <path /> elements', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.length, 6);
});

test('first <path /> element has correct fill color', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.fill, '#F0AD00');
});

test('first <path /> element has correct d property set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.d, 'M161.649 152.782l69.865-69.866H91.783z');
});

test('second <path /> element has correct fill color', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(1)?.props.fill, '#7FD13B');
});

test('second <path /> element has correct d property set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(
        pathElements.at(1)?.props.d,
        'M8.867 0l70.374 70.375h152.972L161.838 0zM246.999 85.162l76.138 76.137-76.485 76.485-76.138-76.138z',
    );
});

test('third <path /> element has correct fill color', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.fill, '#60B5CC');
});

test('third <path /> element has correct d property set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.d, 'M323.298 143.724V0H179.573z');
});

test('fourth <path /> element has correct fill color', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(3)?.props.fill, '#5A6378');
});

test('fourth <path /> element has correct d property set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(3)?.props.d, 'M152.781 161.649L0 8.868v305.564z');
});

test('fifth <path /> element has correct fill color', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(4)?.props.fill, '#F0AD00');
});

test('fifth <path /> element has correct d property set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(4)?.props.d, 'M255.522 246.655l67.776 67.777V178.879z');
});

test('sixth <path /> element has correct fill color', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(5)?.props.fill, '#60B5CC');
});

test('sixth <path /> element has correct d property set', (t) => {
    const { root } = renderElmIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(5)?.props.d, 'M161.649 170.517L8.869 323.298H314.43z');
});
