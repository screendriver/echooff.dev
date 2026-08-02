const mochaBaseConfig = require("./mocha.base.config.cjs");

module.exports = {
	...mochaBaseConfig,
	spec: ["./source/**/*.test.ts", "./source/**/*.test.tsx"]
};
