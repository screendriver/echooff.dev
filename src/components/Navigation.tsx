import React from 'react';
import styled from '@emotion/styled';
import { black, cyan, darkerWhite } from '../colors';

const NavigationStyled = styled.nav({
  backgroundColor: black,
  display: 'flex',
  justifyContent: 'space-around',
  padding: 10,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  '& a': {
    color: darkerWhite,
    textDecoration: 'none',
  },
});

const List = styled.ul({
  display: 'flex',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  textTransform: 'uppercase',
});

const ListItem = styled.li({});

const Link = styled.a({
  display: 'block',
  fontSize: 14,
  padding: 15,
  letterSpacing: 1,
  ':hover': {
    color: cyan,
  },
  ':target': {
    color: cyan,
  },
});

const MeLink = styled(Link)({
  fontSize: 18,
  fontWeight: 600,
});

export function Navigation() {
  return (
    <NavigationStyled>
      <MeLink href="#header">Christian Rackerseder</MeLink>
      <List>
        <ListItem>
          <Link href="#about">About</Link>
        </ListItem>
        <ListItem>
          <Link href="#skills">Skills</Link>
        </ListItem>
        <ListItem>
          <Link href="#portfolio">Portfolio</Link>
        </ListItem>
        <ListItem>
          <Link href="#experience">Resume</Link>
        </ListItem>
        <ListItem>
          <Link href="#contact">Contact</Link>
        </ListItem>
      </List>
    </NavigationStyled>
  );
}
