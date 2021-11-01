import { useEffect, FunctionComponent } from 'react';
import ky from 'ky';

export const Quickmetrics: FunctionComponent = () => {
  useEffect(() => {
    void ky('/api/quickmetrics');
  });
  return null;
};
