import React from 'react';
import styled from '@emotion/styled';

const NavigationStyled = styled.nav({
  backgroundColor: '#121d1f',
  display: 'flex',
  justifyContent: 'space-around',
  padding: 10,
  position: 'sticky',
  top: 0,
  '& a': {
    color: '#f4f5f6',
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
  fontFamily: 'Open Sans,sans-serif',
  fontSize: 14,
  padding: 15,
  letterSpacing: 1,
  ':hover': {
    color: '#7bc3d1',
  },
  ':target': {
    color: '#7bc3d1',
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
          <Link href="#skils">Skills</Link>
        </ListItem>
        <ListItem>
          <Link href="#portfolio">Portfolio</Link>
        </ListItem>
        <ListItem>
          <Link href="#resume">Resume</Link>
        </ListItem>
        <ListItem>
          <Link href="#contact">Contact</Link>
        </ListItem>
      </List>
    </NavigationStyled>
  );
}
