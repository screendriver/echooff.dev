export default {
	files: ["./source/**/*.test.ts"],
	typescript: {
		rewritePaths: {
			"source/": "target/source/",
		},
		compile: false,
	},
};
