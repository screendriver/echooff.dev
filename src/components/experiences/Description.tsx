import React, { FC } from 'react';
import styled from '@emotion/styled';
import { Experience } from '.';
import { black } from '../../colors';

interface DescriptionProps {
  experience: Experience;
}

const Industry = styled.h4({
  color: black,
  textTransform: 'uppercase',
  fontSize: 16,
  fontWeight: 600,
});

const JobTitle = styled.h5({
  color: '#629ca7',
  fontSize: 20,
  fontWeight: 600,
});

const JobDescription = styled.p({});

export const Description: FC<DescriptionProps> = ({ experience }) => {
  return (
    <div>
      <Industry>{experience.industry}</Industry>
      <JobTitle>{experience.jobTitle}</JobTitle>
      <JobDescription>{experience.jobDescription}</JobDescription>
    </div>
  );
};
