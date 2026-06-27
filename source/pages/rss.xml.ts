import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { createBlogRssFeedOptions } from "../blog/blog-rss-feed.ts";

export const GET: APIRoute = async (apiContext) => {
	const blogPosts = await getCollection("blog");

	return rss(createBlogRssFeedOptions(blogPosts, apiContext.site));
};
