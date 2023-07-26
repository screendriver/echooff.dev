import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import vercel from "@astrojs/vercel/static";

export default defineConfig({
	srcDir: "source",
	output: "static",
	compressHTML: true,
	adapter: vercel({
		analytics: true,
	}),
	integrations: [
		tailwind(),
		image({
			serviceEntryPoint: "@astrojs/image/sharp",
		}),
	],
	markdown: {
		shikiConfig: {
			theme: "dracula",
		},
	},
	site: "https://www.echooff.dev",
	experimental: {
		assets: true,
	},
});
