import { defineConfig, sharpImageService } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	srcDir: "source",
	output: "hybrid",
	outDir: "./target",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		service: sharpImageService(),
	},
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
