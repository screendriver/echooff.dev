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
