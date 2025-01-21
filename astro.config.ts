import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	adapter: node({
		mode: "standalone",
	}),
	integrations: [vue({ devtools: true }), tailwind()],
	markdown: {
		shikiConfig: {
			theme: "dracula",
		},
	},
	server: {
		port: 4321,
	},
	site: "https://www.echooff.dev",
});
