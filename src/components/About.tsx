import React from 'react';
import styled from '@emotion/styled';
import Img, { FixedObject } from 'gatsby-image';
import { grey } from '../colors';
import { Section, SectionTheme } from './Section';

interface AboutProps {
  image: FixedObject;
}

const AboutImage = styled(Img)({
  marginTop: 40,
  borderRadius: 180,
});

const Text = styled.p({
  color: grey,
  fontSize: 14,
  marginTop: 20,
  marginRight: '20%',
  marginLeft: '20%',
  textAlign: 'left',
});

const GoneText = styled.h5({
  textTransform: 'uppercase',
  color: grey,
  fontSize: 14,
  fontWeight: 700,
});

export function About({ image }: AboutProps) {
  return (
    <Section heading="About" theme={SectionTheme.Light}>
      <AboutImage fixed={image} />
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
