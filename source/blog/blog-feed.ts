import { isValidDate } from "@sindresorhus/is";
import type { CollectionEntry } from "astro:content";
import { all, err, ok, type Result } from "true-myth/result";
import { createBlogPostAbsoluteUrl } from "./blog-site.ts";

export type RssFeedItem = {
	readonly title: string;
	readonly description: string;
	readonly link: string;
	readonly pubDate: Date;
	readonly customData?: string;
};

function createRssFeedItemForBlogPost(
	blogPost: CollectionEntry<"blog">,
	configuredSiteUrl: URL
): Result<RssFeedItem, TypeError> {
	const { description, publishedAt, title, updatedAt } = blogPost.data;
	const publishedAtDate = new Date(publishedAt);

	if (!isValidDate(publishedAtDate)) {
		return err(new TypeError(`Published at "${publishedAt}" is not a valid ISO 8601 date-time`));
	}

	if (updatedAt === undefined) {
		return ok({
			title,
			description,
			link: createBlogPostAbsoluteUrl(configuredSiteUrl, blogPost.id),
			pubDate: publishedAtDate
		});
	}

	const updatedAtDate = new Date(updatedAt);

	if (!isValidDate(updatedAtDate)) {
		return err(new TypeError(`Updated at "${updatedAt}" is not a valid ISO 8601 date-time`));
	}

	return ok({
		title,
		description,
		link: createBlogPostAbsoluteUrl(configuredSiteUrl, blogPost.id),
		pubDate: publishedAtDate,
		customData: `<atom:updated>${updatedAt}</atom:updated>`
	});
}

export function createRssFeedItemsForBlogPosts(
	blogPosts: readonly CollectionEntry<"blog">[],
	configuredSiteUrl: URL
): Result<RssFeedItem[], TypeError> {
	return all(
		blogPosts.map((blogPost) => {
			return createRssFeedItemForBlogPost(blogPost, configuredSiteUrl);
		})
	);
}
