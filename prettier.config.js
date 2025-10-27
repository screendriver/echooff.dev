export default {
	plugins: ["prettier-plugin-astro"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro"
			}
		}
	],
	printWidth: 120,
	tabWidth: 4,
	useTabs: true,
	trailingComma: "none"
};
