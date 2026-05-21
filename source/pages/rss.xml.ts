import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { createRssFeedItemsForBlogPosts } from "../blog/blog-feed.ts";
import { sortBlogPostsByPublicationDateDescending } from "../blog/blog-posts.ts";
import { getConfiguredSiteUrlOrThrow } from "../blog/blog-site.ts";

export const GET: APIRoute = async (apiContext) => {
	const configuredSiteUrl = getConfiguredSiteUrlOrThrow(apiContext.site);
	const blogPosts = sortBlogPostsByPublicationDateDescending(await getCollection("blog"));

	return rss({
		title: "Christian Rackerseder | Blog",
		description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
		site: configuredSiteUrl,
		trailingSlash: false,
		items: createRssFeedItemsForBlogPosts(blogPosts, configuredSiteUrl)
	});
};
