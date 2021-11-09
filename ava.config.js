export default {
    files: ['./test/unit/**/*.test.*'],
    extensions: ['ts', 'tsx'],
    require: ['@swc-node/register', './test/setup.js'],
    serial: true,
};
