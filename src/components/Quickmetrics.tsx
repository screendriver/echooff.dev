import { useEffect, FunctionComponent } from 'react';
import ky from 'ky';

export const Quickmetrics: FunctionComponent = () => {
  useEffect(() => {
    void ky('/.netlify/functions/quickmetrics');
  });
  return null;
};
