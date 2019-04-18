import test, { Test, TestCase } from 'tape';
import { createConfig } from '../../../src/shared/config';

function withDeleteEnvs(testFn: TestCase): TestCase {
  return (t: Test) => {
    testFn(t);
    delete process.env.GATSBY_VISUAL_REGRESSION_TEST;
  };
}

test(
  'visualRegressionTest is true when GATSBY_VISUAL_REGRESSION_TEST is "true"',
  withDeleteEnvs(t => {
    t.plan(1);
    process.env.GATSBY_VISUAL_REGRESSION_TEST = 'true';
    const { visualRegressionTest } = createConfig();
    t.true(visualRegressionTest);
  }),
);

test(
  'visualRegressionTest is false when GATSBY_VISUAL_REGRESSION_TEST is not set',
  withDeleteEnvs(t => {
    t.plan(1);
    const { visualRegressionTest } = createConfig();
    t.false(visualRegressionTest);
  }),
);
