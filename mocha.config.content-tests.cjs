const mochaBaseConfig = require("./mocha.base.config.cjs");

module.exports = {
	...mochaBaseConfig,
	spec: ["./tests/content/**/*.test.ts"],
	slow: 750,
	timeout: 15_000
};
