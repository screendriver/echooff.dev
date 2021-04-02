import { FunctionComponent } from 'react';
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
import { useTranslation } from 'react-i18next';
import { Section, ColorScheme } from './Section';

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
    ':nth-last-of-type(-n+3)': {
      marginBottom: 0,
    },
  },
});

export const Passions: FunctionComponent = () => {
  const [t] = useTranslation();
  return (
    <Section
      heading={t('passions.heading')}
      id="passions"
      colorScheme={ColorScheme.Light}
    >
      <List>
        <ListItem>
          <Check size={30} />
          <p>{t('passions.tdd')}</p>
        </ListItem>
        <ListItem>
          <Compass size={30} />
          <p>{t('passions.clean_code')}</p>
        </ListItem>
        <ListItem>
          <Zap size={30} />
          <p>{t('passions.performance')}</p>
        </ListItem>
        <ListItem>
          <Server size={30} />
          <p>{t('passions.serverless')}</p>
        </ListItem>
        <ListItem>
          <Layers size={30} />
          <p>{t('passions.jamstack')}</p>
        </ListItem>
        <ListItem>
          <Cloud size={30} />
          <p>{t('passions.cloud')}</p>
        </ListItem>
        <ListItem>
          <Activity size={30} />
          <p>{t('passions.agile')}</p>
        </ListItem>
      </List>
    </Section>
  );
};
