import { defineConfig } from "astro/config";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
		rehypePlugins: [
			rehypeHeadingIds,
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						ariaLabel: "Copy link to this section",
						className: ["blog-heading-anchor-link"],
						title: "Copy link to this section"
					}
				}
			]
		],
		shikiConfig: {
			theme: "dracula"
		}
	},
	server: {
		port: 4321
	},
	site: "https://www.echooff.dev"
});
