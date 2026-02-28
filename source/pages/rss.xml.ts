import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { createRssFeedItemsForBlogPosts } from "../blog/blog-feed.js";
import { sortBlogPostsByPublicationDateDescending } from "../blog/blog-posts.js";
import { getConfiguredSiteUrlOrThrow } from "../blog/blog-site.js";

export const GET: APIRoute = async (apiContext) => {
	const configuredSiteUrl = getConfiguredSiteUrlOrThrow(apiContext.site);
	const blogPosts = sortBlogPostsByPublicationDateDescending(await getCollection("blog"));

	return rss({
		title: "Christian Rackerseder — Blog",
		description: "Notes on web technologies, engineering decisions, and front-end architecture.",
		site: configuredSiteUrl,
		items: createRssFeedItemsForBlogPosts(blogPosts, configuredSiteUrl)
	});
};
