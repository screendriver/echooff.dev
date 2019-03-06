import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Menu } from 'react-feather';
import { black, cyan, darkerWhite } from '../colors';

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

const ListItemMenu = styled.li({
  display: 'none',
  margin: 'auto',
});

const NavigationStyled = styled.nav({
  backgroundColor: black,
  display: 'flex',
  justifyContent: 'space-around',
  padding: 10,
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

const List = styled.ul(
  {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    textTransform: 'uppercase',
    '@media screen and (max-width: 600px)': {
      justifyContent: 'space-between',
      [ListItemMenu as any]: {
        display: 'initial',
      },
      [ListItem as any]: {
        display: 'none',
      },
    },
  },
  (props: { mobileMenuVisible: boolean }) => {
    return props.mobileMenuVisible
      ? {
          flexDirection: 'column',
          [ListItem as any]: {
            display: 'initial',
          },
        }
      : {
          flexDirection: 'row',
        };
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
      <List mobileMenuVisible={mobileMenuVisible}>
        <ListItemMenu>
          <Menu
            color={darkerWhite}
            onClick={handleMenuClick(setMobileMenuVisible)}
          />
        </ListItemMenu>
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
