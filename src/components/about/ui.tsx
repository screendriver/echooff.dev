import React from 'react';
import styled from '@emotion/styled';
import Img, { FixedObject } from 'gatsby-image';
import { grey } from '../../colors';
import { Section, SectionTheme } from '../Section';

const AboutImage = styled(Img)({
  borderRadius: 180,
  marginBottom: 20,
});

const Text = styled.p({
  color: grey,
  fontSize: 14,
  textAlign: 'justify',
  '@media (min-width: 768px)': {
    marginLeft: '10%',
    marginRight: '10%',
  },
  '@media (min-width: 1024px)': {
    width: 700,
  },
});

const GoneText = styled.h5({
  textTransform: 'uppercase',
  color: grey,
  fontSize: 14,
  fontWeight: 700,
});

export interface AboutUiProps {
  fixedImage: FixedObject;
}

export function AboutUi({ fixedImage }: AboutUiProps) {
  return (
    <Section heading="About" id="about" theme={SectionTheme.Light}>
      <AboutImage fixed={fixedImage} />
      <Text>
        JavaScript is everywhere. In the old days, being a JavaScript developer
        meant that you were a front end web developer. Forever bound to the
        browser.
      </Text>
      <GoneText>Those days are gone.</GoneText>
      <Text>
        The rise of Node.js ushered in a new era. An era where being a
        JavaScript developer doesn’t necessarily mean a front-end web developer.
        As a JavaScript developer today, you can target more platforms than any
        other high level language.
      </Text>
    </Section>
  );
}
