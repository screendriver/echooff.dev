import { defineConfig } from "astro/config";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { buildHeadingAnchorLinkContent } from "./source/blog/heading-anchor-link-content.js";

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	trailingSlash: "never",
	adapter: node({
		mode: "standalone"
	}),
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
		processor: unified({
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
							dataPagefindIgnore: "all",
							title: "Copy link to this section"
						}
					}
				]
			]
		}),
		shikiConfig: {
			theme: "dracula"
		}
	},
	server: {
		port: 4321
	},
	site: "https://www.echooff.dev"
});
