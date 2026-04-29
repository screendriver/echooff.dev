import { defineConfig } from "astro/config";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { buildHeadingAnchorLinkContent } from "./source/blog/heading-anchor-link-content.js";

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	trailingSlash: "never",
	build: {
		format: "file"
	},
	integrations: [sitemap()],
	vite: {
		css: {
			devSourcemap: true
		},
		build: {
			sourcemap: false
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
					content: buildHeadingAnchorLinkContent,
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
