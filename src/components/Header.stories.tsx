import React from 'react';
import { Header } from './Header';
import { Config } from '../shared/config';

export default { title: 'Organisms', component: Header };

export function header() {
  const config: Config = {
    visualRegressionTest: true,
  };
  return <Header config={config} />;
}
