import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/static";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import image from "@astrojs/image";

export default defineConfig({
	adapter: vercel(),
	output: "static",
	integrations: [
		tailwind(),
		svelte(),
		image({
			serviceEntryPoint: "@astrojs/image/sharp",
		}),
	],
	site: "https://www.echooff.dev",
});
