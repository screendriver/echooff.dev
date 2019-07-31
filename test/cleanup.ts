import { Test, TestCase } from 'tape';
import { cleanup } from '@testing-library/react';

export function withCleanup(testCase: TestCase): TestCase {
  return async (t: Test) => {
    await testCase(t);
    cleanup();
  };
}
