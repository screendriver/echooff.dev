import { assert } from 'chai';
import { createConfig } from '../../../src/shared/config';

suite('config', () => {
  teardown(() => {
    delete process.env.GATSBY_VISUAL_REGRESSION_TEST;
  });

  test('visualRegressionTest is true when GATSBY_VISUAL_REGRESSION_TEST is "true"', () => {
    process.env.GATSBY_VISUAL_REGRESSION_TEST = 'true';
    const { visualRegressionTest } = createConfig();
    assert.isTrue(visualRegressionTest);
  });

  test('visualRegressionTest is false when GATSBY_VISUAL_REGRESSION_TEST is not set', () => {
    const { visualRegressionTest } = createConfig();
    assert.isFalse(visualRegressionTest);
  });
});
