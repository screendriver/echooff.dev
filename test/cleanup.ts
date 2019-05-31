import { Test, TestCase } from 'tape';
import { cleanup } from '@testing-library/react';

export function withCleanup(testCase: TestCase): TestCase {
  return (t: Test) => {
    testCase(t);
    cleanup();
  };
}
