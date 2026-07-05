module.exports = {
	diff: true,
	"forbid-pending": true,
	extension: ["ts"],
	ignore: [],
	jobs: 1,
	parallel: false,
	reporter: "dot",
	slow: 75,
	timeout: 2000,
	ui: "tdd",
	"node-option": ["enable-source-maps"]
};
