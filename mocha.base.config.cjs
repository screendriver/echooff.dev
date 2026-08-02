module.exports = {
	diff: true,
	"forbid-pending": true,
	extension: ["ts", "tsx"],
	ignore: [],
	jobs: 1,
	parallel: false,
	reporter: "dot",
	slow: 75,
	timeout: 2000,
	ui: "tdd",
	"node-option": [
		"enable-source-maps",
		"import=tsx",
		"import=./source/test-support/scss-module-loader.mjs"
	]
};
