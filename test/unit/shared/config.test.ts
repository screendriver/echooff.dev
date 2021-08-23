import assert from 'assert';
import { createConfig } from '../../../src/shared/config';

suite('config', function () {
  teardown(function () {
    delete process.env.GATSBY_VISUAL_REGRESSION_TEST;
  });

  test('visualRegressionTest is true when GATSBY_VISUAL_REGRESSION_TEST is "true"', function () {
    process.env.GATSBY_VISUAL_REGRESSION_TEST = 'true';
    const { visualRegressionTest } = createConfig();
    assert.strictEqual(visualRegressionTest, true);
  });

  test('visualRegressionTest is false when GATSBY_VISUAL_REGRESSION_TEST is not set', function () {
    const { visualRegressionTest } = createConfig();
    assert.strictEqual(visualRegressionTest, false);
  });
});
