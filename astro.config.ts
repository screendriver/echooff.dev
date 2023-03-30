import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import image from "@astrojs/image";

export default defineConfig({
	output: "static",
	outDir: "target/dist",
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
