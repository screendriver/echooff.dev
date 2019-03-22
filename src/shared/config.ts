export interface Config {
  visualRegressionTest: boolean;
}

export function createConfig(): Config {
  return {
    visualRegressionTest: process.env.GATSBY_VISUAL_REGRESSION_TEST === 'true',
  };
}
