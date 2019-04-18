import { Test, TestCase } from 'tape';
import { cleanup } from 'react-testing-library';

export function withCleanup(testCase: TestCase): TestCase {
  return (t: Test) => {
    testCase(t);
    cleanup();
  };
}
