import { useEffect } from 'react';
import ky from 'ky';

export function Quickmetrics() {
  useEffect(() => {
    ky('/.netlify/functions/quickmetrics');
  });
  return null;
}
