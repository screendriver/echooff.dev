module.exports = {
  spec: 'test/unit/**/*.test.*',
  require: ['esm', 'ts-node/register', './test/setup.ts'],
  extension: ['ts', 'tsx'],
  ui: 'tdd',
};
