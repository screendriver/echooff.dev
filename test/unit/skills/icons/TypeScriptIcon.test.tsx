import React from 'react';
import test from 'ava';
import { create, ReactTestRenderer } from 'react-test-renderer';
import { Factory } from 'fishery';
import { TypeScriptIcon, TypeScriptIconProps } from '../../../../src/skills/icons/TypeScriptIcon';

const typeScriptIconPropsFactory = Factory.define<TypeScriptIconProps>(() => {
    return {};
});

function renderTypeScriptIcon(propsOverrides?: Partial<TypeScriptIconProps>): ReactTestRenderer {
    const props = typeScriptIconPropsFactory.build(propsOverrides);
    return create(<TypeScriptIcon className={props.className} />);
}

test('renders an <svg /> element', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElements = root.findAllByType('svg');

    t.is(svgElements.length, 1);
});

test('<svg /> element has 100% width and height', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.width, '100%');
    t.is(svgElement.props.height, '100%');
});

test('<svg /> element has a viewbox set', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.viewBox, '0 0 256 256');
});

test('<svg /> element does not have a className by default', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, undefined);
});

test('<svg /> accepts a className', (t) => {
    const props = typeScriptIconPropsFactory.build({
        className: 'foo',
    });
    const { root } = renderTypeScriptIcon(props);
    const svgElement = root.findByType('svg');

    t.is(svgElement.props.className, 'foo');
});

test('<svg /> renders two <path /> element', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.length, 2);
});

test('first <path /> element has correct fill color', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.fill, '#007ACC');
});

test('first <path /> element has correct d property set', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(0)?.props.d, 'M0 128v128h256V0H0z');
});

test('second <path /> element has correct fill color', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(pathElements.at(1)?.props.fill, '#FFF');
});

test('second <path /> element has correct d property set', (t) => {
    const { root } = renderTypeScriptIcon();
    const svgElement = root.findByType('svg');
    const pathElements = svgElement.findAllByType('path');

    t.is(
        pathElements.at(1)?.props.d,
        'M56.611 128.85l-.081 10.483h33.32v94.68H113.42v-94.68h33.32v-10.28c0-5.69-.122-10.444-.284-10.566-.122-.162-20.399-.244-44.983-.203l-44.739.122-.122 10.443zM206.567 118.108c6.501 1.626 11.459 4.51 16.01 9.224 2.357 2.52 5.851 7.112 6.136 8.209.08.325-11.053 7.802-17.798 11.987-.244.163-1.22-.894-2.317-2.52-3.291-4.794-6.745-6.867-12.028-7.232-7.76-.529-12.759 3.535-12.718 10.32 0 1.992.284 3.17 1.097 4.796 1.707 3.535 4.876 5.648 14.832 9.955 18.326 7.884 26.168 13.085 31.045 20.48 5.445 8.25 6.664 21.415 2.966 31.208-4.063 10.646-14.14 17.88-28.323 20.277-4.388.772-14.79.65-19.504-.203-10.28-1.829-20.033-6.908-26.047-13.572-2.357-2.601-6.949-9.387-6.664-9.875.122-.162 1.178-.812 2.356-1.503 1.138-.65 5.446-3.13 9.509-5.486l7.355-4.267 1.544 2.276c2.154 3.291 6.867 7.802 9.712 9.305 8.167 4.308 19.383 3.698 24.909-1.26 2.357-2.153 3.332-4.388 3.332-7.68 0-2.966-.366-4.266-1.91-6.5-1.99-2.845-6.054-5.243-17.595-10.24-13.206-5.69-18.895-9.225-24.096-14.833-3.007-3.25-5.852-8.452-7.03-12.8-.975-3.616-1.22-12.678-.447-16.335 2.723-12.76 12.353-21.658 26.25-24.3 4.51-.853 14.994-.528 19.424.57z',
    );
});
