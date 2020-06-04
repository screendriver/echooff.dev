import React, { FunctionComponent } from 'react';
import styled from '@emotion/styled';
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
  return (
    <Section heading="Skills" id="skills" colorScheme={ColorScheme.Cyan}>
      <SkillsList>
        <Card
          linkTo="https://www.typescriptlang.org"
          linkText="TypeScript"
          icon={<TypeScriptIcon />}
          description="is a typed
            superset of JavaScript that compiles to plain JavaScript."
        />
        <Card
          linkTo="https://www.ecma-international.org/publications/standards/Ecma-262.htm"
          linkText="JavaScript"
          icon={<JavaScriptIcon />}
          description="is a high-level, interpreted programming language that conforms to
          the ECMAScript specification."
        />
        <Card
          linkTo="https://reactjs.org"
          linkText="React"
          icon={<ReactIcon />}
          description="is a library for building
          user interfaces."
        />
        <Card
          linkTo="https://nodejs.org"
          linkText="Node.js"
          icon={<NodejsIcon />}
          description="is a JavaScript runtime
          built on Chrome's V8 JavaScript engine."
        />
        <Card
          linkTo="https://www.w3.org/Style/CSS/"
          linkText="Cascading Style Sheets (CSS)"
          icon={<Css3Icon />}
          description="is a simple mechanism for adding style (e.g., fonts, colors,
            spacing) to Web documents."
        />
        <Card
          linkTo="https://elm-lang.org"
          linkText="elm"
          icon={<ElmIcon />}
          description="is a delightful language for reliable webapps."
        />
      </SkillsList>
    </Section>
  );
};
