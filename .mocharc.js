module.exports = {
  spec: 'test/unit/**/*.test.*',
  require: ['ts-node/register/transpile-only', './test/setup.ts'],
  extension: ['ts', 'tsx'],
  ui: 'tdd',
  reporter: 'dot',
};
