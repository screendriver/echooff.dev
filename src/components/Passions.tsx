import React from 'react';
import {
  Activity,
  Check,
  Compass,
  Cloud,
  Zap,
  Server,
  Layers,
} from 'react-feather';
import styled from '@emotion/styled';
import { Section, SectionTheme } from './Section';

const List = styled.ul({
  display: 'flex',
  justifyContent: 'space-evenly',
  flexWrap: 'wrap',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  '@media (min-width: 1024px)': {
    width: 800,
  },
});

const ListItem = styled.li({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  width: 140,
  marginBottom: 20,
  ':last-child': {
    marginBottom: 0,
  },
  '@media (min-width: 768px)': {
    ':nth-last-child(-n+3)': {
      marginBottom: 0,
    },
  },
});

export function Passions() {
  return (
    <Section heading="Passions" id="passions" theme={SectionTheme.Light}>
      <List>
        <ListItem>
          <Activity size={30} />
          <p>Agile</p>
        </ListItem>
        <ListItem>
          <Check size={30} />
          <p>TDD</p>
        </ListItem>
        <ListItem>
          <Compass size={30} />
          <p>Clean Code</p>
        </ListItem>
        <ListItem>
          <Zap size={30} />
          <p>Performance</p>
        </ListItem>
        <ListItem>
          <Server size={30} />
          <p>Serverless</p>
        </ListItem>
        <ListItem>
          <Cloud size={30} />
          <p>Cloud computing</p>
        </ListItem>
        <ListItem>
          <Layers size={30} />
          <p>JAMstack</p>
        </ListItem>
      </List>
    </Section>
  );
}
