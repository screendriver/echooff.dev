import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { CssIcon, CssIconProps } from '../../../../src/skills/icons/CssIcon';

const cssIconPropsFactory = Factory.define<CssIconProps>(() => {
    return {};
});

function renderCssIcon(propsOverrides?: Partial<CssIconProps>): ReactTestRenderer {
    const props = cssIconPropsFactory.build(propsOverrides);
    return create(<CssIcon className={props.className} />);
}

test('renders an <svg /> element', (t) => {
    const { root } = renderCssIcon();
    const svgElements = root.findAllByType('svg');

    t.is(svgElements.length, 1);
});

test('<svg /> element has 100% width and height', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.width, '100%');
    t.is(svgElement.props.height, '100%');
});

test('<svg /> element has a viewbox set', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.viewBox, '85.5 210.272 437.29 491.728');
});

test('<svg /> element does not have a className by default', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, undefined);
});

test('<svg /> accepts a className', (t) => {
    const props = cssIconPropsFactory.build({
        className: 'foo',
    });
    const { root } = renderCssIcon(props);
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, 'foo');
});

test('<svg /> renders three <path /> elements', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.length, 3);
});

test('first <path /> element has correct fill color', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.fill, '#1572B6');
});

test('first <path /> element has correct d property set', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.d, 'M128.668 652.845L89.21 210.272h433.58l-39.5 442.503L305.735 702z');
});

test('second <path /> element has correct fill color', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(1)?.props.fill, '#33A9DC');
});

test('second <path /> element has correct d property set', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(1)?.props.d, 'M306 664.375l143.474-39.776 33.755-378.14H306z');
});

test('third <path /> element has correct fill color', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(2)?.props.fill, '#FFF');
});

test('third <path /> element has correct d property set', (t) => {
    const { root } = renderCssIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(
        pathElements.at(2)?.props.d,
        'M167.739 293.569l-.308 54.766H390.34l-.08 35.375H167.203l-.161 54.766h222.909l-.293 62.462-84.061 29.75-83.639-29.75.063-27.087h-54.765l-.251 65.719 138.353 49.289 138.877-49.289.467-98.873.141-19.834.568-127.292-277.672-.002z',
    );
});
