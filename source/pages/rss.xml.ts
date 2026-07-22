import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { isErr } from "true-myth/result";
import { createBlogRssFeedOptions } from "../blog/blog-rss-feed.ts";

export const GET: APIRoute = async (apiContext) => {
	const blogPosts = await getCollection("blog");
	const blogRssFeedOptionsResult = createBlogRssFeedOptions(blogPosts, apiContext.site);

	if (isErr(blogRssFeedOptionsResult)) {
		throw blogRssFeedOptionsResult.error;
	}

	return rss(blogRssFeedOptionsResult.value);
};
