import test from 'ava';
import { createConfig } from '../../../src/shared/config';

test.afterEach(() => {
  delete process.env.GATSBY_VISUAL_REGRESSION_TEST;
});

test('visualRegressionTest is true when GATSBY_VISUAL_REGRESSION_TEST is "true"', t => {
  process.env.GATSBY_VISUAL_REGRESSION_TEST = 'true';
  const { visualRegressionTest } = createConfig();
  t.is(visualRegressionTest, true);
});

test('visualRegressionTest is false when GATSBY_VISUAL_REGRESSION_TEST is not set', t => {
  const { visualRegressionTest } = createConfig();
  t.is(visualRegressionTest, false);
});
