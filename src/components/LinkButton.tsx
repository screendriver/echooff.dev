import React, { FC } from 'react';
import styled from '@emotion/styled';

interface LinkButtonProps {
  href: string;
}

const Link = styled.a({
  color: 'white',
  display: 'inline-block',
  border: '1px solid white',
  padding: '10px 20px',
  fontSize: 16,
  textDecoration: 'none',
  ':hover': {
    backgroundColor: '#121d1f',
    borderColor: '#121d1f',
  },
});

export const LinkButton: FC<LinkButtonProps> = ({ href, children }) => {
  return <Link href={href}>{children}</Link>;
};
