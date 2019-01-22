import React from 'react';
import styled from '@emotion/styled';
import Img, { FixedObject } from 'gatsby-image';

interface AboutProps {
  image: FixedObject;
}

const AboutStyled = styled.div({
  fontFamily: 'Open sans,sans-serif',
  padding: '100px 0',
  textAlign: 'center',
});

const Title = styled.h1({
  fontWeight: 400,
  color: '#121d1f',
});

const Line = styled.hr({
  height: 4,
  width: 70,
  backgroundColor: '#7bc3d1',
  border: 0,
  marginBottom: 80,
});

const AboutImage = styled(Img)({
  borderRadius: 180,
  zIndex: -1,
});

const Text = styled.p({
  color: '#656c6d',
  fontSize: 14,
  marginTop: 20,
  marginRight: '20%',
  marginLeft: '20%',
  textAlign: 'left',
});

const GoneText = styled.h5({
  textTransform: 'uppercase',
  color: '#656c6d',
  fontSize: 14,
  fontWeight: 700,
});

export function About({ image }: AboutProps) {
  return (
    <AboutStyled id="about">
      <Title>About</Title>
      <Line />
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
    </AboutStyled>
  );
}
