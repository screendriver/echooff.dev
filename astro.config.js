import process from "node:process";
import { URL } from "node:url";
import { defineConfig } from "astro/config";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import node from "@astrojs/node";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import { Maybe } from "true-myth/maybe";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { buildHeadingAnchorLinkContent } from "./source/blog/heading-anchor-link-content.js";
import { createDevelopmentServerProxy } from "./source/development-proxy.js";

const developmentServerProxy = createDevelopmentServerProxy({
	deterministicServerUrl: Maybe.of(process.env.DETERMINISTIC_SERVER_URL)
});

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
	security: {
		checkOrigin: true,
		allowedDomains: [
			{
				hostname: "www.echooff.dev",
				protocol: "https"
			}
		]
	},
	integrations: [
		preact(),
		sitemap({
			filter: shouldIncludePageInSitemap
		})
	],
	vite: {
		server: {
			proxy: developmentServerProxy.unwrapOr(undefined),
			watch: {
				ignored: ["**/target/**"]
			}
		},
		css: {
			devSourcemap: true
		},
		build: {
			manifest: true
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
