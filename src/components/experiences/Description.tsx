import { FunctionComponent } from 'react';
import styled from '@emotion/styled';
import { Experience } from '.';
import { black, grey } from '../../colors';

interface DescriptionProps {
  experience: Experience;
  className?: string;
}

const Industry = styled.h4({
  color: black,
  textTransform: 'uppercase',
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '17.6px',
  marginTop: 0,
  marginBottom: 10,
});

const JobTitle = styled.h5({
  color: '#629ca7',
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '22px',
  marginTop: 0,
  marginBottom: 0,
});

const JobDescription = styled.p({
  color: grey,
  fontSize: 14,
  lineHeight: '20px',
});

export const Description: FunctionComponent<DescriptionProps> = ({
  className,
  experience,
}) => {
  return (
    <div className={className}>
      <Industry>{experience.industry}</Industry>
      <JobTitle>{experience.jobTitle}</JobTitle>
      <JobDescription>{experience.jobDescription}</JobDescription>
    </div>
  );
};
