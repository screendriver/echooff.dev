import is from "@sindresorhus/is";
import type { CollectionEntry } from "astro:content";
import readingTime from "reading-time";
import { getBlogPostTopicDetails } from "./blog-post-topics.ts";

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

export function createLatestBlogIndexEntries(
	blogPosts: readonly CollectionEntry<"blog">[],
	maximumEntryCount: number
): readonly BlogIndexEntry[] {
	return createBlogIndexEntries(sortBlogPostsByPublicationDateDescending(blogPosts)).slice(0, maximumEntryCount);
}

export function createBlogPostPageTitle(blogPostTitle: string): string {
	return `${blogPostTitle} | ${siteOwnerName}`;
}

export function createBlogPostReadingTimeLabel(markdownDocumentBody: string): string {
	return readingTime(markdownDocumentBody).text;
}

export function formatPublishedAtFallbackDateTime(publishedAt: string): string {
	const publishedAtDate = new Date(publishedAt);

	if (!is.validDate(publishedAtDate)) {
		throw new TypeError(`Published at "${publishedAt}" is not a valid ISO 8601 date-time`);
	}

	return publishedAt.slice(0, 10);
}
