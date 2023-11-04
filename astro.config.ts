import { defineConfig, sharpImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
	srcDir: "source",
	output: "static",
	integrations: [tailwind()],
	image: {
		service: sharpImageService(),
	},
	markdown: {
		shikiConfig: {
			theme: "dracula",
		},
	},
	site: "https://www.echooff.dev",
});
