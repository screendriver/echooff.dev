import { FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { Section, ColorScheme } from '../Section';
import { Card } from './Card';
import { TypeScriptIcon } from './icons/typescript';
import { JavaScriptIcon } from './icons/javascript';
import { ReactIcon } from './icons/react';
import { NodejsIcon } from './icons/nodejs';
import { Css3Icon } from './icons/css3';
import { ElmIcon } from './icons/elm';

const SkillsList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  '@media (min-width: 375px)': {
    flexDirection: 'row',
    width: 300,
  },
  '@media (min-width: 768px)': {
    width: 700,
  },
  '@media (min-width: 1024px)': {
    width: 800,
  },
});

export const Skills: FunctionComponent = () => {
  const [t] = useTranslation();
  return (
    <Section
      heading={t('skills.heading')}
      id="skills"
      colorScheme={ColorScheme.Cyan}
    >
      <SkillsList>
        <Card
          linkTo="https://www.typescriptlang.org"
          linkText="TypeScript"
          icon={<TypeScriptIcon />}
          description={t('skills.typescript')}
        />
        <Card
          linkTo="https://www.ecma-international.org/publications/standards/Ecma-262.htm"
          linkText="JavaScript"
          icon={<JavaScriptIcon />}
          description={t('skills.javascript')}
        />
        <Card
          linkTo="https://reactjs.org"
          linkText="React"
          icon={<ReactIcon />}
          description={t('skills.react')}
        />
        <Card
          linkTo="https://nodejs.org"
          linkText="Node.js"
          icon={<NodejsIcon />}
          description={t('skills.nodejs')}
        />
        <Card
          linkTo="https://www.w3.org/Style/CSS/"
          linkText="Cascading Style Sheets (CSS)"
          icon={<Css3Icon />}
          description={t('skills.css')}
        />
        <Card
          linkTo="https://elm-lang.org"
          linkText="elm"
          icon={<ElmIcon />}
          description={t('skills.elm')}
        />
      </SkillsList>
    </Section>
  );
};
