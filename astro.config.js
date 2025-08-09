import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	adapter: node({
		mode: "standalone"
	}),
	integrations: [vue({ devtools: true })],
	vite: {
		plugins: [tailwindcss()],
		build: {
			sourcemap: true
		},
		esbuild: {
			legalComments: "none"
		}
	},
	markdown: {
		shikiConfig: {
			theme: "dracula"
		}
	},
	server: {
		port: 4321
	},
	site: "https://www.echooff.dev"
});
