import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Menu } from 'react-feather';
import { black, cyan, darkerWhite, grey } from '../colors';

const Link = styled.a({
  display: 'block',
  fontSize: 14,
  padding: 15,
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

const ListItem = styled.li();

const MenuLink = styled.a({
  display: 'none',
  padding: 15,
});

const NavigationStyled = styled.nav({
  backgroundColor: black,
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  padding: 10,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  '@media screen and (max-width: 600px)': {
    alignItems: 'center',
    justifyContent: 'space-between',
    [MenuLink as any]: {
      display: 'initial',
    },
  },
});

const List = styled.ul(
  {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    textTransform: 'uppercase',
    '@media screen and (max-width: 600px)': {
      width: '100%',
      flexDirection: 'column',
      [ListItem as any]: {
        display: 'none',
      },
    },
  },
  (props: { mobileMenuVisible: boolean }) =>
    props.mobileMenuVisible
      ? {
          flexDirection: 'column',
          [ListItem as any]: {
            display: 'initial',
          },
          '@media screen and (max-width: 600px)': {
            '::before': {
              content: '""',
              borderBottom: `1px solid ${grey}`,
            },
          },
        }
      : {
          flexDirection: 'row',
          '@media screen and (max-width: 600px)': {
            '::before': {
              content: '""',
            },
          },
        },
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
