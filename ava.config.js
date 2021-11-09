export default {
    files: ['./test/unit/**/*.test.*'],
    extensions: ['ts', 'tsx'],
    require: ['esbuild-register', './test/setup.js'],
    serial: true,
};
