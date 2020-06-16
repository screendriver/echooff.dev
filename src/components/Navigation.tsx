import React, { FunctionComponent, useState } from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
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

const List = styled.ul<{ mobileMenuVisible: boolean }>(
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
  (props) => (props.mobileMenuVisible ? { display: 'block' } : {}),
);

function handleMenuClick(
  setMobileMenuVisible: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return () => {
    setMobileMenuVisible((prevState) => !prevState);
  };
}

function handleLinkClick(
  setMobileMenuVisible: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return () => {
    setMobileMenuVisible(false);
  };
}

export const Navigation: FunctionComponent = () => {
  const [t] = useTranslation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  return (
    <NavigationStyled>
      <MeLink href="#header">{t('navigation.name')}</MeLink>
      <MenuLink id={t('navigation.title')}>
        <Menu
          color={darkerWhite}
          onClick={handleMenuClick(setMobileMenuVisible)}
        />
      </MenuLink>
      <List mobileMenuVisible={mobileMenuVisible}>
        <ListItem>
          <Link href="#about" onClick={handleLinkClick(setMobileMenuVisible)}>
            {t('navigation.about')}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="#skills" onClick={handleLinkClick(setMobileMenuVisible)}>
            {t('navigation.skills')}
          </Link>
        </ListItem>
        <ListItem>
          <Link
            href="#passions"
            onClick={handleLinkClick(setMobileMenuVisible)}
          >
            {t('navigation.passions')}
          </Link>
        </ListItem>
        <ListItem>
          <Link
            href="#experience"
            onClick={handleLinkClick(setMobileMenuVisible)}
          >
            {t('navigation.resume')}
          </Link>
        </ListItem>
        <ListItem>
          <Link href="#contact" onClick={handleLinkClick(setMobileMenuVisible)}>
            {t('navigation.contact')}
          </Link>
        </ListItem>
      </List>
    </NavigationStyled>
  );
};
