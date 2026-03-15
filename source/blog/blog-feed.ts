import is from "@sindresorhus/is";
import type { CollectionEntry } from "astro:content";
import { createBlogPostAbsoluteUrl } from "./blog-site.js";

export type RssFeedItem = {
	readonly title: string;
	readonly description: string;
	readonly link: string;
	readonly pubDate: Date;
};

export function createRssFeedItemsForBlogPosts(
	blogPosts: readonly CollectionEntry<"blog">[],
	configuredSiteUrl: URL | undefined
): RssFeedItem[] {
	return blogPosts.map((blogPost) => {
		const publishedAtDate = new Date(blogPost.data.publishedAt);

		if (!is.validDate(publishedAtDate)) {
			throw new TypeError(`Published at "${blogPost.data.publishedAt}" is not a valid ISO 8601 date-time`);
		}

		return {
			title: blogPost.data.title,
			description: blogPost.data.description,
			link: createBlogPostAbsoluteUrl(configuredSiteUrl, blogPost.id),
			pubDate: publishedAtDate
		};
	});
}
