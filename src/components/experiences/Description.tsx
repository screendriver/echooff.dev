import React, { FC } from 'react';
import { Experience } from '.';

interface DescriptionProps {
  experience: Experience;
}

export const Description: FC<DescriptionProps> = ({ experience }) => {
  return (
    <div>
      <h1>{experience.industry}</h1>
      <h2>{experience.jobTitle}</h2>
      <p>{experience.jobDescription}</p>
    </div>
  );
};
