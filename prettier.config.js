export default {
	plugins: ["prettier-plugin-astro"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro"
			}
		},
		{
			files: "source/content/blog/*.md",
			options: {
				printWidth: 80,
				tabWidth: 2,
				useTabs: false
			}
		}
	],
	printWidth: 120,
	tabWidth: 4,
	useTabs: true,
	trailingComma: "none"
};
