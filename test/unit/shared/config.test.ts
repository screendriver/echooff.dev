import { createConfig } from '../../../src/shared/config';

afterEach(() => {
  delete process.env.GATSBY_VISUAL_REGRESSION_TEST;
});

test('visualRegressionTest is true when GATSBY_VISUAL_REGRESSION_TEST is "true"', () => {
  process.env.GATSBY_VISUAL_REGRESSION_TEST = 'true';
  const { visualRegressionTest } = createConfig();
  expect(visualRegressionTest).toBe(true);
});

test('visualRegressionTest is false when GATSBY_VISUAL_REGRESSION_TEST is not set', () => {
  const { visualRegressionTest } = createConfig();
  expect(visualRegressionTest).toBe(false);
});
