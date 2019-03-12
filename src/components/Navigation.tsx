import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Menu } from 'react-feather';
import { darkerWhite, black, grey, cyan } from '../colors';

const Link = styled.a({
  letterSpacing: 1,
  color: darkerWhite,
  textDecoration: 'none',
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

const ListItem = styled.li({
  paddingTop: 13,
  paddingBottom: 13,
  ':last-child': {
    paddingBottom: 0,
  },
  '@media screen and (min-width: 768px)': {
    [Link as any]: {
      padding: 13,
    },
  },
});

const MenuLink = styled.a({
  '@media screen and (min-width: 768px)': {
    display: 'none',
  },
});

const NavigationStyled = styled.nav({
  backgroundColor: black,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  padding: 15,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  '@media screen and (min-width: 768px)': {
    justifyContent: 'space-around',
  },
});

const List = styled.ul(
  {
    listStyleType: 'none',
    padding: 0,
    display: 'none',
    width: '100%',
    textTransform: 'uppercase',
    fontSize: 14,
    borderTop: `1px solid ${grey}`,
    '@media screen and (min-width: 768px)': {
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: 'none',
      width: 'initial',
      margin: 0,
      marginRight: 15,
    },
  },
  (props: { mobileMenuVisible: boolean }) =>
    props.mobileMenuVisible ? { display: 'block' } : {},
);

function handleMenuClick(
  setMobileMenuVisible: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return () => {
    setMobileMenuVisible(prevState => !prevState);
  };
}

export function Navigation() {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  return (
    <NavigationStyled>
      <MeLink href="#header">Christian Rackerseder</MeLink>
      <MenuLink>
        <Menu
          color={darkerWhite}
          onClick={handleMenuClick(setMobileMenuVisible)}
        />
      </MenuLink>
      <List mobileMenuVisible={mobileMenuVisible}>
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
