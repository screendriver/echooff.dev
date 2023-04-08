const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,svelte,md,mdx,svg}"],
	theme: {
		letterSpacing: {
			widest: ".25em"
		},
		extend: {
			fontFamily: {
				sans: ['"JetBrains Mono"', ...defaultTheme.fontFamily.sans]
			},
			borderWidth: {
				3: "3px"
			},
			margin: {
				"1/12": "8.333333%"
			},
			keyframes: {
				"cursor-blink": {
					from: {
						opacity: 0
					},
					to: {
						opacity: 1
					}
				}
			},
			animation: {
				"cursor-blink": "cursor-blink 1.5s steps(2) infinite"
			}
		}
	},
	plugins: [require("tailwind-dracula")("dracula"), require("@tailwindcss/typography")]
};
