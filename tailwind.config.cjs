/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		letterSpacing: {
			widest: ".25em"
		},
		extend: {
			borderWidth: {
				3: "3px"
			},
			margin: {
				"1/12": "8.333333%"
			}
		}
	},
	plugins: [require("tailwind-dracula")("dracula")]
};
