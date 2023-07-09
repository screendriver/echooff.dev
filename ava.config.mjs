export default {
	files: ["./source/**/*.test.ts"],
	extensions: {
		ts: "module",
		tsx: "module",
	},
	nodeArguments: ["--no-warnings", "--loader=tsx"],
};
