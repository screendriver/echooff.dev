import 'modern-normalize';
import 'typeface-source-sans-pro';
import React, { useEffect } from 'react';
import { css, Global } from '@emotion/core';
import styled from '@emotion/styled';
import { TweenMax, TimelineMax, Power1 } from 'gsap';
import { SEO } from '../components/SEO';
import { YetiSVG } from '../components/YetiSVG';

const globalStyles = css({
  margin: 0,
  padding: 0,
  fontSize: 16,
  '-webkit-font-smoothing': 'antialiased',
  backgroundColor: '#09334f',
  position: 'relative',
});

const Content = styled.div({
  padding: '5rem 3rem 0 25rem',
  position: 'relative',
  zIndex: 10,
  fontFamily: 'Source Sans Pro, sans-serif',
  color: '#FFF',
});

const Hello = styled.h3({
  margin: '0 0 .8rem',
  fontSize: '2.625rem',
  fontWeight: 900,
  lineHeight: '120%',
});

const Text = styled.p({
  fontSize: '1.25rem',
  fontWeight: 'normal',
  lineHeight: '150%',
  color: '#d1e2ed',
});

const Link = styled.span({
  textDecoration: 'line-through',
});

function run() {
  const furLightColor = '#FFF';
  const furDarkColor = '#67b1e0';
  const skinLightColor = '#ddf1fa';
  const skinDarkColor = '#88c9f2';
  const lettersSideLight = '#3A7199';
  const lettersSideDark = '#051d2c';
  const lettersFrontLight = '#67B1E0';
  const lettersFrontDark = '#051d2c';
  const lettersStrokeLight = '#265D85';
  const lettersStrokeDark = '#031219';
  const mouthShape1 =
    'M149 115.7c-4.6 3.7-6.6 9.8-5 15.6.1.5.3 1.1.5 1.6.6 1.5 2.4 2.3 3.9 1.7l11.2-4.4 11.2-4.4c1.5-.6 2.3-2.4 1.7-3.9-.2-.5-.4-1-.7-1.5-2.8-5.2-8.4-8.3-14.1-7.9-3.7.2-5.9 1.1-8.7 3.2z';
  const mouthShape2 =
    'M161.2 118.9c0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1 .4-2 1.1-2.7.7-.8 1.8-1.3 2.9-1.3 2.2 0 4 1.7 4 4z';
  const mouthShape3 =
    'M149.2 116.7c-4.6 3.7-6.7 8.8-5.2 14.6.1.3.1.5.2.8.6 1.5 2.4 2.3 3.9 1.7l11.2-4.4 11.2-4.4c1.5-.6 2.3-2.4 1.7-3.9-.1-.3-.2-.5-.4-.7-2.8-5.2-8.2-7.2-14-6.9-3.6.2-5.9 1.1-8.6 3.2z';
  const chatterTL = new TimelineMax({ paused: true, repeat: -1, yoyo: true });
  chatterTL
    .to(
      ['#mouthBG', '#mouthPath', '#mouthOutline'],
      0.1,
      { morphSVG: mouthShape3 },
      '0',
    )
    .to('#chin', 0.1, { y: 1.5 }, '0');
  const yetiTL = new TimelineMax({
    paused: true,
    repeat: -1,
    repeatDelay: 0,
    delay: 0,
  });
  yetiTL
    .addCallback(() => {
      chatterTL.play();
    }, '0')

    .to(['#armL', '#flashlightFront'], 0.075, { x: 7 }, '2.5')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 0 }, '2.575')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 7 }, '2.65')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 0 }, '2.725')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 7 }, '2.8')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 0 }, '2.875')
    // @ts-ignore
    .addCallback(goLight, '3.2')
    .addCallback(goDark, '3.3')
    .addCallback(goLight, '3.4')

    .addCallback(() => {
      chatterTL.pause();
      TweenMax.to(
        ['#mouthBG', '#mouthPath', '#mouthOutline'],
        0.1,
        { morphSVG: mouthShape1 },
        // '0',
      );
    }, '3.2')

    .to(
      ['#mouthBG', '#mouthPath', '#mouthOutline'],
      0.25,
      { morphSVG: mouthShape2 },
      '5',
    )
    .to('#tooth1', 0.1, { y: -5 }, '5')
    .to(
      '#armR',
      0.5,
      {
        x: 10,
        y: 30,
        rotation: 10,
        transformOrigin: 'bottom center',
        ease: Power1.easeOut,
      },
      '4',
    )
    .to(
      ['#eyeL', '#eyeR'],
      0.25,
      { scaleX: 1.4, scaleY: 1.4, transformOrigin: 'center center' },
      '5',
    )

    .addCallback(goDark, '8')
    .addCallback(goLight, '8.1')
    .addCallback(goDark, '8.3')
    .addCallback(goLight, '8.4')
    .addCallback(goDark, '8.6')

    .to(
      ['#mouthBG', '#mouthPath', '#mouthOutline'],
      0.25,
      { morphSVG: mouthShape1 },
      '9',
    )
    .to('#tooth1', 0.1, { y: 0 }, '9')
    .to(
      '#armR',
      0.5,
      {
        x: 0,
        y: 0,
        rotation: 0,
        transformOrigin: 'bottom center',
        ease: Power1.easeOut,
      },
      '9',
    )
    .to(
      ['#eyeL', '#eyeR'],
      0.25,
      { scaleX: 1, scaleY: 1, transformOrigin: 'center center' },
      '9',
    )
    .addCallback(() => {
      chatterTL.play();
    }, '9.25')

    .to(['#armL', '#flashlightFront'], 0.075, { x: 7 }, '11.5')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 0 }, '11.575')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 7 }, '11.65')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 0 }, '11.725')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 7 }, '11.8')
    .to(['#armL', '#flashlightFront'], 0.075, { x: 0 }, '11.875');

  function goDark() {
    TweenMax.set('#light', { visibility: 'hidden' });

    TweenMax.set('.lettersSide', {
      fill: lettersSideDark,
      stroke: lettersStrokeDark,
    });
    TweenMax.set('.lettersFront', {
      fill: lettersFrontDark,
      stroke: lettersStrokeDark,
    });
    TweenMax.set('#lettersShadow', { opacity: 0.05 });

    TweenMax.set('.hlFur', { fill: furDarkColor });
    TweenMax.set('.hlSkin', { fill: skinDarkColor });
  }

  function goLight() {
    TweenMax.set('#light', { visibility: 'visible' });

    TweenMax.set('.lettersSide', {
      fill: lettersSideLight,
      stroke: lettersStrokeLight,
    });
    TweenMax.set('.lettersFront', {
      fill: lettersFrontLight,
      stroke: lettersStrokeLight,
    });
    TweenMax.set('#lettersShadow', { opacity: 0.2 });

    TweenMax.set('.hlFur', { fill: furLightColor });
    TweenMax.set('.hlSkin', { fill: skinLightColor });
  }

  goDark();
  yetiTL.play();
  return () => {
    yetiTL.clear();
  };
}

export default function NotFound() {
  useEffect(run);
  return (
    <>
      <Global
        styles={{
          html: globalStyles,
          body: globalStyles,
        }}
      />
      <SEO title="Error - Page not found" />
      <YetiSVG />
      <Content>
        <Hello>Hello?? Is somebody there?!?</Hello>
        <Text>
          We know it’s scary, but the page you’re trying to reach can’t be
          found. Perhaps it was just a bad <Link>link</Link> dream?
        </Text>
      </Content>
    </>
  );
}
