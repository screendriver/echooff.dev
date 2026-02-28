import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	adapter: node({
		mode: "standalone"
	}),
	integrations: [sitemap()],
	vite: {
		css: {
			devSourcemap: true
		},
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
