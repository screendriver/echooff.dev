import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import image from "@astrojs/image";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
	output: "static",
	adapter: vercel(),
	integrations: [
		tailwind(),
		svelte(),
		image({
			serviceEntryPoint: "@astrojs/image/sharp"
		})
	],
	markdown: {
		shikiConfig: {
			theme: "dracula"
		}
	},
	site: "https://www.echooff.dev"
});
