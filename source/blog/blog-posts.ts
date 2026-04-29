import is from "@sindresorhus/is";
import type { CollectionEntry } from "astro:content";
import { getBlogPostTopicDetails } from "./blog-post-topics.js";

export type BlogIndexEntry = {
	readonly description: string;
	readonly publishedAt: string;
	readonly slug: string;
	readonly title: string;
	readonly topic: string;
	readonly topicSlug: string;
};

const siteOwnerName = "Christian Rackerseder";

export function sortBlogPostsByPublicationDateDescending(
	blogPosts: readonly CollectionEntry<"blog">[]
): CollectionEntry<"blog">[] {
	return Array.from(blogPosts).toSorted((firstBlogPost, secondBlogPost) => {
		const secondPublishedAtValue = Date.parse(secondBlogPost.data.publishedAt);
		const firstPublishedAtValue = Date.parse(firstBlogPost.data.publishedAt);

		if (secondPublishedAtValue !== firstPublishedAtValue) {
			return secondPublishedAtValue - firstPublishedAtValue;
		}

		return firstBlogPost.id.localeCompare(secondBlogPost.id);
	});
}

export function createBlogIndexEntries(blogPosts: readonly CollectionEntry<"blog">[]): readonly BlogIndexEntry[] {
	return blogPosts.map((blogPost) => {
		const topicDetails = getBlogPostTopicDetails(blogPost.data.topic);

		return {
			description: blogPost.data.description,
			publishedAt: blogPost.data.publishedAt,
			slug: blogPost.id,
			title: blogPost.data.title,
			topic: topicDetails.label,
			topicSlug: topicDetails.slug
		};
	});
}

export function createBlogPostPageTitle(blogPostTitle: string): string {
	return `${blogPostTitle} | ${siteOwnerName}`;
}

export function formatPublishedAtFallbackDateTime(publishedAt: string): string {
	const publishedAtDate = new Date(publishedAt);

	if (!is.validDate(publishedAtDate)) {
		throw new TypeError(`Published at "${publishedAt}" is not a valid ISO 8601 date-time`);
	}

	return publishedAt.replace("T", " ").replace(/:\d{2}(?:\.\d+)?(?=[+-]\d{2}:\d{2}|Z$)/u, "");
}
