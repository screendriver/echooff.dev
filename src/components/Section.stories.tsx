import React from 'react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { Section, ColorScheme } from './Section';

export default {
  title: 'Organisms',
  component: Section,
  parameters: { foo: 'bar' },
  decorators: [withKnobs],
};

export function section() {
  const options = {
    Cyan: ColorScheme.Cyan,
    Light: ColorScheme.Light,
  };
  const defaultValue = ColorScheme.Cyan;
  const colorScheme = select('Colors', options, defaultValue);
  return <Section heading="Test Section" id="test" colorScheme={colorScheme} />;
}
