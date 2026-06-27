import type { CollectionEntry } from "astro:content";
import { createRssFeedItemsForBlogPosts, type RssFeedItem } from "./blog-feed.ts";
import { sortBlogPostsByPublicationDateDescending } from "./blog-posts.ts";
import { getConfiguredSiteUrlOrThrow } from "./blog-site.ts";

export type BlogRssFeedOptions = {
	readonly title: string;
	readonly description: string;
	readonly site: URL;
	readonly trailingSlash: false;
	readonly items: RssFeedItem[];
};

export function createBlogRssFeedOptions(
	blogPosts: readonly CollectionEntry<"blog">[],
	configuredSiteUrl: URL | undefined
): BlogRssFeedOptions {
	const resolvedSiteUrl = getConfiguredSiteUrlOrThrow(configuredSiteUrl);
	const sortedBlogPosts = sortBlogPostsByPublicationDateDescending(blogPosts);

	return {
		title: "Christian Rackerseder | Blog",
		description: "Notes on web technologies, engineering tradeoffs, and front-end architecture.",
		site: resolvedSiteUrl,
		trailingSlash: false,
		items: createRssFeedItemsForBlogPosts(sortedBlogPosts, resolvedSiteUrl)
	};
}
