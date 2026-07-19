import { URL } from "node:url";
import { defineConfig } from "astro/config";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { buildHeadingAnchorLinkContent } from "./source/blog/heading-anchor-link-content.js";

function shouldIncludePageInSitemap(absolutePageUrl) {
	const parsedPageUrl = new URL(absolutePageUrl);
	const pagePathname = parsedPageUrl.pathname;

	return pagePathname !== "/blog/search";
}

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	trailingSlash: "never",
	adapter: node({
		mode: "standalone"
	}),
	integrations: [
		sitemap({
			filter: shouldIncludePageInSitemap
		})
	],
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
