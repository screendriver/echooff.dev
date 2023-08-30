import { defineConfig, sharpImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/static";

export default defineConfig({
	srcDir: "source",
	output: "static",
	adapter: vercel({
		imageService: true,
		imagesConfig: {
			sizes: [640, 768, 1024, 1280, 1920],
			formats: ["image/avif", "image/webp"],
			domains: [],
		},
	}),
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
