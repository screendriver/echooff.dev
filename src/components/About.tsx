import React from 'react';
import styled from '@emotion/styled';
import Img, { FixedObject } from 'gatsby-image';

interface AboutProps {
  image: FixedObject;
}

const AboutStyled = styled.div({
  padding: '100px 0',
  textAlign: 'center',
});

const Title = styled.h1({
  fontFamily: 'Open sans,sans-serif',
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

export function About({ image }: AboutProps) {
  return (
    <AboutStyled id="about">
      <Title>About</Title>
      <Line />
      <AboutImage fixed={image} />
    </AboutStyled>
  );
}
