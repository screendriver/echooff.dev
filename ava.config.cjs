module.exports = {
    files: ['./test/unit/**/*.test.*'],
    extensions: ['ts', 'tsx'],
    require: ['esbuild-register', './test/setup.js'],
};
