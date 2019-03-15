import React from 'react';
import { Activity, Check, Compass, Cloud, Zap } from 'react-feather';
import styled from '@emotion/styled';
import { Section, SectionTheme } from './Section';

const List = styled.ul({
  display: 'flex',
  justifyContent: 'space-evenly',
  width: '70%',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
});

const ListItem = styled.li({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
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
          <Cloud size={30} />
          <p>Cloud computing</p>
        </ListItem>
      </List>
    </Section>
  );
}
