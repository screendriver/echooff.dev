import { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslation, Trans } from 'react-i18next';
import { StaticImage } from 'gatsby-plugin-image';
import { grey } from '../colors';
import { Section, ColorScheme } from './Section';

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

export const About: FunctionComponent = () => {
  const [t] = useTranslation();
  return (
    <Section
      heading={t('about.heading')}
      id="about"
      colorScheme={ColorScheme.Light}
    >
      <StaticImage
        alt="My face"
        src="../img/about.jpg"
        width={200}
        height={200}
        quality={75}
        css={css({
          borderRadius: 180,
          marginBottom: 20,
        })}
      />
      <Trans i18nKey="about.text">
        <Text>
          JavaScript is everywhere. In the old days, being a JavaScript
          developer meant that you were a front end web developer. Forever bound
          to the browser.
        </Text>
        <GoneText>Those days are gone.</GoneText>
        <Text>
          The rise of Node.js ushered in a new era. An era where being a
          JavaScript developer doesn’t necessarily mean a front-end web
          developer. As a JavaScript developer today, you can target more
          platforms than any other high level language.
        </Text>
      </Trans>
    </Section>
  );
};
